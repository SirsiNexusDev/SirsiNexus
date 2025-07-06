"""
Advanced Cost Prediction Models
Phase 3 Implementation: AI Orchestration & ML Platform

Multi-model ensemble for accurate cost predictions:
- LSTM for time series cost forecasting
- Random Forest for resource-based cost estimation  
- XGBoost for complex multi-feature cost modeling
- Ensemble methods for improved accuracy
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from abc import ABC, abstractmethod

# ML Libraries
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import json

# Time series libraries
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class CostPredictionInput:
    """Input features for cost prediction models"""
    resource_type: str
    instance_type: str
    region: str
    usage_hours: float
    cpu_cores: int
    memory_gb: float
    storage_gb: float
    network_gb: float
    historical_costs: List[float]
    usage_patterns: Dict[str, float]
    timestamp: datetime
    metadata: Dict[str, Any]


@dataclass
class CostPredictionOutput:
    """Output from cost prediction models"""
    predicted_cost: float
    confidence_interval: Tuple[float, float]
    model_name: str
    features_importance: Dict[str, float]
    uncertainty: float
    timestamp: datetime
    metadata: Dict[str, Any]


@dataclass
class EnsemblePrediction:
    """Combined prediction from multiple models"""
    final_prediction: float
    model_predictions: Dict[str, float]
    model_weights: Dict[str, float]
    ensemble_confidence: float
    uncertainty_bounds: Tuple[float, float]
    timestamp: datetime


class BaseCostModel(ABC):
    """Abstract base class for cost prediction models"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.feature_names = []
        self.training_history = []
        
    @abstractmethod
    def train(self, X: np.ndarray, y: np.ndarray, **kwargs) -> Dict[str, float]:
        """Train the model"""
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        pass
    
    @abstractmethod
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        pass
    
    def save_model(self, filepath: str) -> None:
        """Save trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_name': self.model_name,
            'is_trained': self.is_trained,
            'training_history': self.training_history
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Model {self.model_name} saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.model_name = model_data['model_name']
        self.is_trained = model_data['is_trained']
        self.training_history = model_data.get('training_history', [])
        logger.info(f"Model {self.model_name} loaded from {filepath}")


class LSTMCostPredictor(BaseCostModel):
    """
    LSTM Neural Network for Time Series Cost Forecasting
    Optimized for temporal patterns and seasonal variations
    """
    
    def __init__(self, hidden_size: int = 64, num_layers: int = 2, dropout: float = 0.2):
        super().__init__("LSTM_CostPredictor")
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.dropout = dropout
        self.sequence_length = 30  # 30-day lookback
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def _build_model(self, input_size: int) -> nn.Module:
        """Build LSTM neural network"""
        class LSTMModel(nn.Module):
            def __init__(self, input_size, hidden_size, num_layers, dropout):
                super(LSTMModel, self).__init__()
                self.hidden_size = hidden_size
                self.num_layers = num_layers
                
                self.lstm = nn.LSTM(
                    input_size, hidden_size, num_layers, 
                    batch_first=True, dropout=dropout
                )
                self.fc1 = nn.Linear(hidden_size, hidden_size // 2)
                self.fc2 = nn.Linear(hidden_size // 2, 1)
                self.relu = nn.ReLU()
                self.dropout = nn.Dropout(dropout)
                
            def forward(self, x):
                h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
                c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
                
                out, _ = self.lstm(x, (h0, c0))
                out = self.dropout(out[:, -1, :])  # Take last output
                out = self.relu(self.fc1(out))
                out = self.dropout(out)
                out = self.fc2(out)
                return out
        
        return LSTMModel(input_size, self.hidden_size, self.num_layers, self.dropout)
    
    def _prepare_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare time series sequences for LSTM"""
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:(i + self.sequence_length)])
            y.append(data[i + self.sequence_length])
        return np.array(X), np.array(y)
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 100, 
              batch_size: int = 32, learning_rate: float = 0.001) -> Dict[str, float]:
        """Train LSTM model"""
        logger.info(f"Training {self.model_name} with {len(X)} samples")
        
        # Normalize features
        self.scaler = MinMaxScaler()
        X_scaled = self.scaler.fit_transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)
        y_scaled = y.reshape(-1, 1)
        y_scaler = MinMaxScaler()
        y_scaled = y_scaler.fit_transform(y_scaled).flatten()
        
        # Prepare sequences
        X_seq, y_seq = self._prepare_sequences(
            np.column_stack([X_scaled.reshape(X_scaled.shape[0], -1), y_scaled])
        )
        X_seq, y_seq = X_seq[:, :, :-1], X_seq[:, -1, -1]  # Split features and target
        
        # Convert to tensors
        X_tensor = torch.FloatTensor(X_seq).to(self.device)
        y_tensor = torch.FloatTensor(y_seq).to(self.device)
        
        # Split train/validation
        train_size = int(0.8 * len(X_tensor))
        X_train, X_val = X_tensor[:train_size], X_tensor[train_size:]
        y_train, y_val = y_tensor[:train_size], y_tensor[train_size:]
        
        # Build and train model
        input_size = X_seq.shape[2]
        self.model = self._build_model(input_size).to(self.device)
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        
        train_losses, val_losses = [], []
        
        for epoch in range(epochs):
            self.model.train()
            total_loss = 0
            
            for i in range(0, len(X_train), batch_size):
                batch_X = X_train[i:i+batch_size]
                batch_y = y_train[i:i+batch_size]
                
                optimizer.zero_grad()
                outputs = self.model(batch_X).squeeze()
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            
            # Validation
            self.model.eval()
            with torch.no_grad():
                val_outputs = self.model(X_val).squeeze()
                val_loss = criterion(val_outputs, y_val).item()
            
            avg_train_loss = total_loss / (len(X_train) // batch_size)
            train_losses.append(avg_train_loss)
            val_losses.append(val_loss)
            
            if epoch % 10 == 0:
                logger.info(f"Epoch {epoch}/{epochs}, Train Loss: {avg_train_loss:.6f}, Val Loss: {val_loss:.6f}")
        
        self.is_trained = True
        self.y_scaler = y_scaler
        
        # Calculate metrics
        with torch.no_grad():
            train_pred = self.model(X_train).squeeze().cpu().numpy()
            val_pred = self.model(X_val).squeeze().cpu().numpy()
            
            # Inverse transform predictions
            train_pred_orig = y_scaler.inverse_transform(train_pred.reshape(-1, 1)).flatten()
            val_pred_orig = y_scaler.inverse_transform(val_pred.reshape(-1, 1)).flatten()
            train_true_orig = y_scaler.inverse_transform(y_train.cpu().numpy().reshape(-1, 1)).flatten()
            val_true_orig = y_scaler.inverse_transform(y_val.cpu().numpy().reshape(-1, 1)).flatten()
            
            train_mae = mean_absolute_error(train_true_orig, train_pred_orig)
            val_mae = mean_absolute_error(val_true_orig, val_pred_orig)
            train_rmse = np.sqrt(mean_squared_error(train_true_orig, train_pred_orig))
            val_rmse = np.sqrt(mean_squared_error(val_true_orig, val_pred_orig))
        
        metrics = {
            'train_mae': train_mae,
            'val_mae': val_mae,
            'train_rmse': train_rmse,
            'val_rmse': val_rmse,
            'final_train_loss': train_losses[-1],
            'final_val_loss': val_losses[-1]
        }
        
        self.training_history.append({
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'hyperparameters': {
                'epochs': epochs,
                'batch_size': batch_size,
                'learning_rate': learning_rate,
                'hidden_size': self.hidden_size,
                'num_layers': self.num_layers,
                'dropout': self.dropout
            }
        })
        
        logger.info(f"LSTM training completed. Validation MAE: {val_mae:.2f}, RMSE: {val_rmse:.2f}")
        return metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make cost predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        self.model.eval()
        with torch.no_grad():
            X_scaled = self.scaler.transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)
            X_tensor = torch.FloatTensor(X_scaled).to(self.device)
            predictions = self.model(X_tensor).squeeze().cpu().numpy()
            
            # Inverse transform predictions
            predictions_orig = self.y_scaler.inverse_transform(predictions.reshape(-1, 1)).flatten()
            
        return predictions_orig
    
    def get_feature_importance(self) -> Dict[str, float]:
        """LSTM feature importance using gradient-based method"""
        if not self.is_trained:
            return {}
        
        # Simplified importance based on model parameters
        importance = {}
        for name, param in self.model.named_parameters():
            if 'weight' in name:
                importance[name] = float(torch.abs(param).mean().item())
        
        # Normalize importance scores
        total = sum(importance.values())
        if total > 0:
            importance = {k: v/total for k, v in importance.items()}
        
        return importance


class RandomForestCostPredictor(BaseCostModel):
    """
    Random Forest for Resource-Based Cost Estimation
    Excellent for handling mixed data types and feature interactions
    """
    
    def __init__(self, n_estimators: int = 100, max_depth: Optional[int] = None, 
                 random_state: int = 42):
        super().__init__("RandomForest_CostPredictor")
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        
    def train(self, X: np.ndarray, y: np.ndarray, **kwargs) -> Dict[str, float]:
        """Train Random Forest model"""
        logger.info(f"Training {self.model_name} with {len(X)} samples")
        
        # Feature scaling
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=self.random_state
        )
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Evaluate model
        train_pred = self.model.predict(X_train)
        test_pred = self.model.predict(X_test)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, train_pred),
            'test_mae': mean_absolute_error(y_test, test_pred),
            'train_rmse': np.sqrt(mean_squared_error(y_train, train_pred)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, test_pred)),
            'train_r2': r2_score(y_train, train_pred),
            'test_r2': r2_score(y_test, test_pred)
        }
        
        self.training_history.append({
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'hyperparameters': {
                'n_estimators': self.n_estimators,
                'max_depth': self.max_depth,
                'random_state': self.random_state
            }
        })
        
        logger.info(f"Random Forest training completed. Test MAE: {metrics['test_mae']:.2f}, R²: {metrics['test_r2']:.4f}")
        return metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make cost predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get Random Forest feature importance"""
        if not self.is_trained:
            return {}
        
        importance_scores = self.model.feature_importances_
        importance = {}
        
        for i, score in enumerate(importance_scores):
            feature_name = f"feature_{i}" if i >= len(self.feature_names) else self.feature_names[i]
            importance[feature_name] = float(score)
        
        return importance


class XGBoostCostPredictor(BaseCostModel):
    """
    XGBoost for Complex Multi-Feature Cost Modeling
    Excellent for capturing non-linear relationships and interactions
    """
    
    def __init__(self, n_estimators: int = 100, learning_rate: float = 0.1, 
                 max_depth: int = 6, random_state: int = 42):
        super().__init__("XGBoost_CostPredictor")
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.random_state = random_state
        
    def train(self, X: np.ndarray, y: np.ndarray, **kwargs) -> Dict[str, float]:
        """Train XGBoost model"""
        logger.info(f"Training {self.model_name} with {len(X)} samples")
        
        # Feature scaling
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=self.random_state
        )
        
        # Train model
        self.model = xgb.XGBRegressor(
            n_estimators=self.n_estimators,
            learning_rate=self.learning_rate,
            max_depth=self.max_depth,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Use validation set for early stopping
        eval_set = [(X_train, y_train), (X_test, y_test)]
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            eval_metric='mae',
            early_stopping_rounds=10,
            verbose=False
        )
        
        self.is_trained = True
        
        # Evaluate model
        train_pred = self.model.predict(X_train)
        test_pred = self.model.predict(X_test)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, train_pred),
            'test_mae': mean_absolute_error(y_test, test_pred),
            'train_rmse': np.sqrt(mean_squared_error(y_train, train_pred)),
            'test_rmse': np.sqrt(mean_squared_error(y_test, test_pred)),
            'train_r2': r2_score(y_train, train_pred),
            'test_r2': r2_score(y_test, test_pred)
        }
        
        self.training_history.append({
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'hyperparameters': {
                'n_estimators': self.n_estimators,
                'learning_rate': self.learning_rate,
                'max_depth': self.max_depth,
                'random_state': self.random_state
            }
        })
        
        logger.info(f"XGBoost training completed. Test MAE: {metrics['test_mae']:.2f}, R²: {metrics['test_r2']:.4f}")
        return metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make cost predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get XGBoost feature importance"""
        if not self.is_trained:
            return {}
        
        importance_scores = self.model.feature_importances_
        importance = {}
        
        for i, score in enumerate(importance_scores):
            feature_name = f"feature_{i}" if i >= len(self.feature_names) else self.feature_names[i]
            importance[feature_name] = float(score)
        
        return importance


class EnsembleCostPredictor:
    """
    Ensemble Cost Predictor combining multiple models
    Uses weighted averaging based on model performance
    """
    
    def __init__(self, models: List[BaseCostModel], 
                 weighting_strategy: str = "performance"):
        self.models = models
        self.weighting_strategy = weighting_strategy
        self.model_weights = {}
        self.is_trained = False
        
    def train(self, X: np.ndarray, y: np.ndarray, **kwargs) -> Dict[str, Dict[str, float]]:
        """Train all ensemble models"""
        logger.info(f"Training ensemble with {len(self.models)} models")
        
        all_metrics = {}
        val_predictions = {}
        
        # Train each model
        for model in self.models:
            logger.info(f"Training {model.model_name}")
            metrics = model.train(X, y, **kwargs)
            all_metrics[model.model_name] = metrics
            
            # Get validation predictions for weight calculation
            if hasattr(model, 'predict'):
                # Use a small validation set
                val_size = min(100, len(X) // 5)
                val_indices = np.random.choice(len(X), val_size, replace=False)
                val_X, val_y = X[val_indices], y[val_indices]
                val_pred = model.predict(val_X)
                val_predictions[model.model_name] = {
                    'predictions': val_pred,
                    'true_values': val_y,
                    'mae': mean_absolute_error(val_y, val_pred)
                }
        
        # Calculate model weights based on performance
        self._calculate_weights(val_predictions)
        self.is_trained = True
        
        logger.info(f"Ensemble training completed. Model weights: {self.model_weights}")
        return all_metrics
    
    def _calculate_weights(self, val_predictions: Dict[str, Dict]) -> None:
        """Calculate model weights based on validation performance"""
        if self.weighting_strategy == "performance":
            # Weight inversely proportional to MAE
            mae_scores = {name: pred['mae'] for name, pred in val_predictions.items()}
            inverse_mae = {name: 1.0 / (mae + 1e-8) for name, mae in mae_scores.items()}
            total_inverse = sum(inverse_mae.values())
            self.model_weights = {name: weight / total_inverse 
                                for name, weight in inverse_mae.items()}
        elif self.weighting_strategy == "equal":
            # Equal weights
            num_models = len(self.models)
            self.model_weights = {model.model_name: 1.0 / num_models 
                                for model in self.models}
        else:
            raise ValueError(f"Unknown weighting strategy: {self.weighting_strategy}")
    
    def predict(self, X: np.ndarray) -> EnsemblePrediction:
        """Make ensemble predictions"""
        if not self.is_trained:
            raise ValueError("Ensemble must be trained before making predictions")
        
        model_predictions = {}
        predictions = []
        
        # Get predictions from all models
        for model in self.models:
            if model.is_trained:
                pred = model.predict(X)
                model_predictions[model.model_name] = float(np.mean(pred))
                predictions.append(pred * self.model_weights[model.model_name])
        
        # Combine predictions
        final_prediction = float(np.sum(predictions, axis=0).mean())
        
        # Calculate ensemble confidence
        pred_std = np.std([pred for pred in model_predictions.values()])
        ensemble_confidence = max(0.0, 1.0 - (pred_std / final_prediction)) if final_prediction > 0 else 0.0
        
        # Calculate uncertainty bounds
        uncertainty = pred_std * 1.96  # 95% confidence interval
        uncertainty_bounds = (
            max(0.0, final_prediction - uncertainty),
            final_prediction + uncertainty
        )
        
        return EnsemblePrediction(
            final_prediction=final_prediction,
            model_predictions=model_predictions,
            model_weights=self.model_weights,
            ensemble_confidence=ensemble_confidence,
            uncertainty_bounds=uncertainty_bounds,
            timestamp=datetime.now()
        )
    
    def get_ensemble_feature_importance(self) -> Dict[str, float]:
        """Get weighted ensemble feature importance"""
        ensemble_importance = {}
        
        for model in self.models:
            if model.is_trained:
                model_importance = model.get_feature_importance()
                weight = self.model_weights.get(model.model_name, 0.0)
                
                for feature, importance in model_importance.items():
                    if feature not in ensemble_importance:
                        ensemble_importance[feature] = 0.0
                    ensemble_importance[feature] += importance * weight
        
        return ensemble_importance


# Example usage and testing
if __name__ == "__main__":
    # Generate synthetic cost data for testing
    np.random.seed(42)
    n_samples = 1000
    
    # Features: [cpu_cores, memory_gb, storage_gb, network_gb, usage_hours, region_cost_factor]
    X = np.random.rand(n_samples, 6)
    X[:, 0] *= 32  # CPU cores (0-32)
    X[:, 1] *= 128  # Memory GB (0-128)
    X[:, 2] *= 1000  # Storage GB (0-1000)
    X[:, 3] *= 100  # Network GB (0-100)
    X[:, 4] *= 720  # Usage hours (0-720 per month)
    X[:, 5] = np.random.choice([0.8, 1.0, 1.2, 1.5], n_samples)  # Region cost factor
    
    # Synthetic cost calculation with some noise
    y = (X[:, 0] * 0.1 + X[:, 1] * 0.05 + X[:, 2] * 0.01 + 
         X[:, 3] * 0.1 + X[:, 4] * 0.02) * X[:, 5] + np.random.normal(0, 10, n_samples)
    y = np.maximum(y, 1.0)  # Ensure positive costs
    
    # Test individual models
    print("Testing Cost Prediction Models")
    print("=" * 50)
    
    # Test Random Forest
    rf_model = RandomForestCostPredictor(n_estimators=50)
    rf_model.feature_names = ['cpu_cores', 'memory_gb', 'storage_gb', 'network_gb', 'usage_hours', 'region_factor']
    rf_metrics = rf_model.train(X, y)
    print(f"Random Forest Test MAE: {rf_metrics['test_mae']:.2f}")
    
    # Test XGBoost
    xgb_model = XGBoostCostPredictor(n_estimators=50)
    xgb_model.feature_names = ['cpu_cores', 'memory_gb', 'storage_gb', 'network_gb', 'usage_hours', 'region_factor']
    xgb_metrics = xgb_model.train(X, y)
    print(f"XGBoost Test MAE: {xgb_metrics['test_mae']:.2f}")
    
    # Test Ensemble
    print("\nTesting Ensemble Model")
    print("=" * 30)
    ensemble = EnsembleCostPredictor([rf_model, xgb_model])
    ensemble_metrics = ensemble.train(X, y)
    
    # Make ensemble prediction
    test_sample = X[:5]  # First 5 samples
    ensemble_pred = ensemble.predict(test_sample)
    print(f"Ensemble Prediction: ${ensemble_pred.final_prediction:.2f}")
    print(f"Model Predictions: {ensemble_pred.model_predictions}")
    print(f"Confidence: {ensemble_pred.ensemble_confidence:.3f}")
    print(f"Uncertainty Bounds: ${ensemble_pred.uncertainty_bounds[0]:.2f} - ${ensemble_pred.uncertainty_bounds[1]:.2f}")
    
    print("\nCost Prediction Models Test Complete!")
