'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Database, Server, HardDrive, AlertTriangle, CheckCircle, Loader,
  Network, Wifi, Router, Shield, Lock, Key, Globe, Cloud, Monitor, Cpu,
  MemoryStick, Smartphone, Printer, Camera, Headphones, Mic, Speaker,
  Gamepad2, Watch, Tablet, Laptop, Desktop, Tv, Radio, Settings,
  FileText, Image, Video, Music, Archive, Folder, CloudDownload,
  CloudUpload, Backup, RefreshCw, Pause, Play, Square, SkipForward,
  Timer, Clock, Calendar, MapPin, Users, UserCheck, UserPlus,
  Building, Home, Factory, Warehouse, Store, School, Hospital,
  Car, Truck, Plane, Ship, Train, Bus, Bike
} from 'lucide-react';
import type { Resource } from '@/types/migration';

// Comprehensive transfer status with detailed metrics
interface TransferStatus {
  bytesTransferred: number;
  totalBytes: number;
  speed: string;
  estimatedTimeRemaining: string;
  errors: TransferError[];
  packetsTransferred: number;
  totalPackets: number;
  compressionRatio: number;
  encryptionOverhead: number;
  networkLatency: number;
  throughputUtilization: number;
}

interface TransferError {
  id: string;
  timestamp: string;
  resourceId: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  resolution?: string;
  retryCount: number;
}

// Comprehensive environment definitions
interface Environment {
  id: string;
  name: string;
  type: 'development' | 'test' | 'staging' | 'production' | 'dr' | 'backup';
  region: string;
  availability_zone: string;
  compliance: string[];
  security_level: 'low' | 'medium' | 'high' | 'critical';
}

interface TransferStepProps {
  onComplete: (artifact?: {name: string; type: string; size: string; content?: string}) => void;
}

export const TransferStep: React.FC<TransferStepProps> = ({ onComplete }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [completedResources, setCompletedResources] = useState<Resource[]>([]);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    bytesTransferred: 0,
    totalBytes: 1024 * 1024 * 1024 * 100, // 100GB
    speed: '0 MB/s',
    estimatedTimeRemaining: 'Calculating...',
    errors: [],
  });

  // Comprehensive enterprise infrastructure resources
  const environments: Environment[] = [
    { id: 'dev', name: 'Development', type: 'development', region: 'us-east-1', availability_zone: 'us-east-1a', compliance: ['SOC2'], security_level: 'medium' },
    { id: 'test', name: 'Testing', type: 'test', region: 'us-east-1', availability_zone: 'us-east-1b', compliance: ['SOC2'], security_level: 'medium' },
    { id: 'staging', name: 'Staging', type: 'staging', region: 'us-east-2', availability_zone: 'us-east-2a', compliance: ['SOC2', 'PCI'], security_level: 'high' },
    { id: 'prod', name: 'Production', type: 'production', region: 'us-west-2', availability_zone: 'us-west-2a', compliance: ['SOC2', 'PCI', 'HIPAA', 'GDPR'], security_level: 'critical' },
    { id: 'dr', name: 'Disaster Recovery', type: 'dr', region: 'eu-west-1', availability_zone: 'eu-west-1a', compliance: ['SOC2', 'GDPR'], security_level: 'critical' },
    { id: 'backup', name: 'Backup Site', type: 'backup', region: 'ap-southeast-1', availability_zone: 'ap-southeast-1a', compliance: ['SOC2'], security_level: 'high' }
  ];

  // Exhaustive list of all possible infrastructure assets
  const comprehensiveResources: Resource[] = [
    // COMPUTE RESOURCES
    { id: 'vm-web-01', name: 'Web Server Cluster', type: 'compute', status: 'not_started', 
      metadata: { size: '120GB', type: 'Virtual Machine', specs: '8 vCPU, 32GB RAM', os: 'Ubuntu 22.04 LTS', environment: 'production', protocol: 'SSH/HTTPS' }},
    { id: 'vm-app-01', name: 'Application Servers', type: 'compute', status: 'not_started',
      metadata: { size: '250GB', type: 'Auto Scaling Group', specs: '16 vCPU, 64GB RAM', os: 'RHEL 9', environment: 'production', protocol: 'SSH/RDP' }},
    { id: 'container-k8s', name: 'Kubernetes Cluster', type: 'compute', status: 'not_started',
      metadata: { size: '500GB', type: 'Container Orchestration', specs: '50 nodes, 200 pods', os: 'Container Linux', environment: 'production', protocol: 'HTTPS/gRPC' }},
    { id: 'serverless-lambda', name: 'Serverless Functions', type: 'compute', status: 'not_started',
      metadata: { size: '15GB', type: 'AWS Lambda', specs: '500 functions', runtime: 'Node.js/Python/Go', environment: 'production', protocol: 'HTTPS' }},
    { id: 'mainframe-z15', name: 'IBM z15 Mainframe', type: 'compute', status: 'not_started',
      metadata: { size: '50TB', type: 'Mainframe', specs: '190 cores, 40TB RAM', os: 'z/OS 2.5', environment: 'production', protocol: 'SNA/TCP' }},

    // DATABASE SYSTEMS
    { id: 'db-postgresql', name: 'PostgreSQL Cluster', type: 'database', status: 'not_started',
      metadata: { size: '2.5TB', type: 'Relational Database', version: '15.2', replicas: '3 read replicas', environment: 'production', protocol: 'PostgreSQL/SSL' }},
    { id: 'db-mysql', name: 'MySQL Database', type: 'database', status: 'not_started',
      metadata: { size: '1.8TB', type: 'Relational Database', version: '8.0', replicas: '2 read replicas', environment: 'production', protocol: 'MySQL/TLS' }},
    { id: 'db-oracle', name: 'Oracle Database', type: 'database', status: 'not_started',
      metadata: { size: '15TB', type: 'Enterprise Database', version: '21c', replicas: 'RAC cluster', environment: 'production', protocol: 'Oracle Net/TLS' }},
    { id: 'db-mongodb', name: 'MongoDB Cluster', type: 'database', status: 'not_started',
      metadata: { size: '5.2TB', type: 'NoSQL Database', version: '6.0', replicas: 'Replica Set', environment: 'production', protocol: 'MongoDB/TLS' }},
    { id: 'db-redis', name: 'Redis Cache Cluster', type: 'database', status: 'not_started',
      metadata: { size: '128GB', type: 'In-Memory Cache', version: '7.0', replicas: '6 node cluster', environment: 'production', protocol: 'Redis/TLS' }},
    { id: 'db-elasticsearch', name: 'Elasticsearch Cluster', type: 'database', status: 'not_started',
      metadata: { size: '8.5TB', type: 'Search Engine', version: '8.8', replicas: '9 node cluster', environment: 'production', protocol: 'HTTP/TLS' }},
    { id: 'db-cassandra', name: 'Cassandra Cluster', type: 'database', status: 'not_started',
      metadata: { size: '12TB', type: 'Wide Column Store', version: '4.1', replicas: '12 node cluster', environment: 'production', protocol: 'CQL/TLS' }},

    // STORAGE SYSTEMS
    { id: 'storage-san-01', name: 'SAN Storage Array', type: 'storage', status: 'not_started',
      metadata: { size: '100TB', type: 'SAN', specs: 'Fibre Channel 32Gb', protocol: 'FC/iSCSI', raid: 'RAID 10', environment: 'production' }},
    { id: 'storage-nas-01', name: 'NAS File Server', type: 'storage', status: 'not_started',
      metadata: { size: '250TB', type: 'NAS', specs: 'NetApp FAS8300', protocol: 'NFS/SMB/iSCSI', shares: '500+ shares', environment: 'production' }},
    { id: 'storage-object', name: 'Object Storage', type: 'storage', status: 'not_started',
      metadata: { size: '500TB', type: 'Object Store', specs: 'S3 Compatible', protocol: 'HTTP/HTTPS', buckets: '1000+ buckets', environment: 'production' }},
    { id: 'storage-dfs', name: 'Distributed File System', type: 'storage', status: 'not_started',
      metadata: { size: '1PB', type: 'DFS', specs: 'HDFS/GlusterFS', protocol: 'HTTP/TCP', nodes: '50 storage nodes', environment: 'production' }},
    { id: 'storage-tape', name: 'Tape Library System', type: 'storage', status: 'not_started',
      metadata: { size: '10PB', type: 'Tape Library', specs: 'LTO-9', protocol: 'SAS/FC', capacity: '5000 tapes', environment: 'backup' }},

    // NETWORK INFRASTRUCTURE
    { id: 'net-core-switch', name: 'Core Switch Stack', type: 'network', status: 'not_started',
      metadata: { size: '5GB', type: 'Layer 3 Switch', specs: 'Cisco Nexus 9000', ports: '288 ports', protocol: 'BGP/OSPF/VXLAN', environment: 'production' }},
    { id: 'net-access-switch', name: 'Access Switches', type: 'network', status: 'not_started',
      metadata: { size: '2GB', type: 'Layer 2 Switch', specs: 'Cisco Catalyst 9300', ports: '1152 ports', protocol: 'STP/LACP', environment: 'production' }},
    { id: 'net-router-border', name: 'Border Router', type: 'network', status: 'not_started',
      metadata: { size: '1GB', type: 'Router', specs: 'Cisco ASR 1000', interfaces: 'WAN/LAN/DMZ', protocol: 'BGP/OSPF/MPLS', environment: 'production' }},
    { id: 'net-firewall', name: 'Next-Gen Firewall', type: 'network', status: 'not_started',
      metadata: { size: '500MB', type: 'NGFW', specs: 'Palo Alto PA-5220', throughput: '20Gbps', protocol: 'ALL/DPI', environment: 'production' }},
    { id: 'net-load-balancer', name: 'Load Balancer Cluster', type: 'network', status: 'not_started',
      metadata: { size: '200MB', type: 'Load Balancer', specs: 'F5 BIG-IP', throughput: '40Gbps', protocol: 'HTTP/HTTPS/TCP/UDP', environment: 'production' }},
    { id: 'net-wireless', name: 'Wireless Infrastructure', type: 'network', status: 'not_started',
      metadata: { size: '1GB', type: 'Wireless Controller', specs: 'Cisco WLC 9800', aps: '500 Access Points', protocol: 'Wi-Fi 6E/802.11ax', environment: 'production' }},
    { id: 'net-wan-sdwan', name: 'SD-WAN Infrastructure', type: 'network', status: 'not_started',
      metadata: { size: '300MB', type: 'SD-WAN', specs: 'Cisco Viptela', sites: '50 sites', protocol: 'MPLS/Internet/LTE', environment: 'production' }},

    // SECURITY INFRASTRUCTURE
    { id: 'sec-iam', name: 'Identity Management', type: 'security', status: 'not_started',
      metadata: { size: '50GB', type: 'IAM', specs: 'Active Directory/LDAP', users: '50,000 users', protocol: 'LDAP/SAML/OAuth', environment: 'production' }},
    { id: 'sec-pki', name: 'PKI Infrastructure', type: 'security', status: 'not_started',
      metadata: { size: '10GB', type: 'PKI', specs: 'Root/Intermediate CAs', certificates: '10,000 certs', protocol: 'HTTPS/TLS', environment: 'production' }},
    { id: 'sec-vault', name: 'Secrets Management', type: 'security', status: 'not_started',
      metadata: { size: '5GB', type: 'Vault', specs: 'HashiCorp Vault', secrets: '5,000 secrets', protocol: 'HTTPS/API', environment: 'production' }},
    { id: 'sec-siem', name: 'SIEM Platform', type: 'security', status: 'not_started',
      metadata: { size: '500GB', type: 'SIEM', specs: 'Splunk Enterprise', events: '1TB/day logs', protocol: 'HTTP/Syslog', environment: 'production' }},
    { id: 'sec-vpn', name: 'VPN Gateway', type: 'security', status: 'not_started',
      metadata: { size: '100MB', type: 'VPN', specs: 'Cisco ASA 5516-X', tunnels: '1000 tunnels', protocol: 'IPSec/SSL', environment: 'production' }},

    // APPLICATION INFRASTRUCTURE
    { id: 'app-web-server', name: 'Web Application Server', type: 'application', status: 'not_started',
      metadata: { size: '80GB', type: 'Web Server', specs: 'Apache/Nginx', sites: '500 websites', protocol: 'HTTP/HTTPS', environment: 'production' }},
    { id: 'app-message-queue', name: 'Message Queue System', type: 'application', status: 'not_started',
      metadata: { size: '150GB', type: 'Message Queue', specs: 'RabbitMQ/Kafka', queues: '200 queues', protocol: 'AMQP/Kafka', environment: 'production' }},
    { id: 'app-api-gateway', name: 'API Gateway', type: 'application', status: 'not_started',
      metadata: { size: '20GB', type: 'API Gateway', specs: 'Kong/AWS API Gateway', apis: '1000 APIs', protocol: 'HTTP/HTTPS/GraphQL', environment: 'production' }},
    { id: 'app-monitoring', name: 'Monitoring Platform', type: 'application', status: 'not_started',
      metadata: { size: '2TB', type: 'Monitoring', specs: 'Prometheus/Grafana', metrics: '100K metrics', protocol: 'HTTP/SNMP', environment: 'production' }},

    // BACKUP & DR SYSTEMS
    { id: 'backup-veeam', name: 'Backup Infrastructure', type: 'backup', status: 'not_started',
      metadata: { size: '10TB', type: 'Backup System', specs: 'Veeam Backup & Replication', jobs: '500 backup jobs', protocol: 'NBD/HotAdd', environment: 'backup' }},
    { id: 'dr-replication', name: 'DR Replication', type: 'backup', status: 'not_started',
      metadata: { size: '50TB', type: 'DR System', specs: 'VMware vSphere Replication', vms: '1000 VMs', protocol: 'vSphere Replication', environment: 'dr' }},

    // ENDPOINT DEVICES
    { id: 'device-workstations', name: 'Employee Workstations', type: 'device', status: 'not_started',
      metadata: { size: '50TB', type: 'Workstation', specs: '2000 desktops/laptops', os: 'Windows 11/macOS', protocol: 'RDP/VNC/SSH', environment: 'production' }},
    { id: 'device-mobile', name: 'Mobile Devices', type: 'device', status: 'not_started',
      metadata: { size: '5TB', type: 'Mobile Device', specs: '5000 smartphones/tablets', os: 'iOS/Android', protocol: 'MDM/ActiveSync', environment: 'production' }},
    { id: 'device-iot', name: 'IoT Devices', type: 'device', status: 'not_started',
      metadata: { size: '1TB', type: 'IoT Device', specs: '10000 sensors/cameras', os: 'Embedded Linux', protocol: 'MQTT/CoAP/HTTP', environment: 'production' }},
    { id: 'device-printers', name: 'Network Printers', type: 'device', status: 'not_started',
      metadata: { size: '100GB', type: 'Printer', specs: '500 multifunction printers', protocol: 'IPP/LPR/SMB', environment: 'production' }},

    // SPECIALIZED SYSTEMS
    { id: 'spec-erp', name: 'ERP System', type: 'application', status: 'not_started',
      metadata: { size: '5TB', type: 'ERP', specs: 'SAP ECC/S4HANA', modules: 'FI/CO/MM/SD', protocol: 'SAP GUI/HTTP', environment: 'production' }},
    { id: 'spec-crm', name: 'CRM Platform', type: 'application', status: 'not_started',
      metadata: { size: '2TB', type: 'CRM', specs: 'Salesforce/Dynamics', users: '10000 users', protocol: 'HTTPS/API', environment: 'production' }},
    { id: 'spec-bi', name: 'Business Intelligence', type: 'application', status: 'not_started',
      metadata: { size: '8TB', type: 'BI Platform', specs: 'Tableau/Power BI', reports: '5000 reports', protocol: 'HTTPS/ODBC', environment: 'production' }},
    { id: 'spec-hpc', name: 'HPC Cluster', type: 'compute', status: 'not_started',
      metadata: { size: '100TB', type: 'HPC', specs: '1000 compute nodes', cores: '50000 cores', protocol: 'InfiniBand/MPI', environment: 'production' }},

    // LEGACY SYSTEMS
    { id: 'legacy-as400', name: 'IBM AS/400 System', type: 'legacy', status: 'not_started',
      metadata: { size: '20TB', type: 'Midrange', specs: 'IBM Power Systems', os: 'IBM i', protocol: '5250/DB2', environment: 'production' }},
    { id: 'legacy-cobol', name: 'COBOL Applications', type: 'legacy', status: 'not_started',
      metadata: { size: '10TB', type: 'Legacy App', specs: 'COBOL/JCL', runtime: 'CICS/IMS', protocol: '3270/SNA', environment: 'production' }},

    // DEVELOPMENT TOOLS
    { id: 'dev-jenkins', name: 'CI/CD Pipeline', type: 'development', status: 'not_started',
      metadata: { size: '500GB', type: 'CI/CD', specs: 'Jenkins/GitLab CI', jobs: '2000 jobs', protocol: 'HTTPS/SSH', environment: 'development' }},
    { id: 'dev-git', name: 'Source Code Repositories', type: 'development', status: 'not_started',
      metadata: { size: '1TB', type: 'SCM', specs: 'Git/SVN', repos: '5000 repositories', protocol: 'Git/HTTPS/SSH', environment: 'development' }},
    { id: 'dev-artifacts', name: 'Artifact Repository', type: 'development', status: 'not_started',
      metadata: { size: '5TB', type: 'Artifact Store', specs: 'Nexus/Artifactory', artifacts: '100K artifacts', protocol: 'HTTP/Maven', environment: 'development' }}
  ];

  // Comprehensive icon mapping for all resource types
  const getResourceIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'compute':
        if (subtype === 'Virtual Machine') return Server;
        if (subtype === 'Container Orchestration') return Cloud;
        if (subtype === 'Mainframe') return Desktop;
        if (subtype === 'HPC') return Cpu;
        return Server;
      case 'database':
        if (subtype === 'In-Memory Cache') return MemoryStick;
        if (subtype === 'Search Engine') return Database;
        return Database;
      case 'storage':
        if (subtype === 'SAN') return HardDrive;
        if (subtype === 'NAS') return Archive;
        if (subtype === 'Object Store') return Cloud;
        if (subtype === 'Tape Library') return Archive;
        return HardDrive;
      case 'network':
        if (subtype === 'Router') return Router;
        if (subtype === 'NGFW') return Shield;
        if (subtype === 'Load Balancer') return Network;
        if (subtype === 'Wireless Controller') return Wifi;
        return Network;
      case 'security':
        if (subtype === 'IAM') return Users;
        if (subtype === 'PKI') return Key;
        if (subtype === 'Vault') return Lock;
        if (subtype === 'VPN') return Shield;
        return Shield;
      case 'application':
        if (subtype === 'Web Server') return Globe;
        if (subtype === 'ERP') return Building;
        if (subtype === 'CRM') return UserCheck;
        if (subtype === 'BI Platform') return BarChart;
        return Settings;
      case 'backup':
        return Backup;
      case 'device':
        if (subtype === 'Workstation') return Desktop;
        if (subtype === 'Mobile Device') return Smartphone;
        if (subtype === 'IoT Device') return Camera;
        if (subtype === 'Printer') return Printer;
        return Monitor;
      case 'legacy':
        return Server;
      case 'development':
        if (subtype === 'CI/CD') return Settings;
        if (subtype === 'SCM') return FileText;
        return Settings;
      default:
        return Server;
    }
  };

  // Filter resources by environment
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(['production']);
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  
  const filteredResources = comprehensiveResources.filter(resource => {
    const envMatch = selectedEnvironments.includes(resource.metadata.environment);
    const typeMatch = resourceFilter === 'all' || resource.type === resourceFilter;
    return envMatch && typeMatch;
  });

  // Get unique resource types
  const resourceTypes = [...new Set(comprehensiveResources.map(r => r.type))];

  // Calculate comprehensive transfer metrics
  const [detailedMetrics, setDetailedMetrics] = useState({
    packetsTransferred: 0,
    totalPackets: 0,
    compressionRatio: 1.2,
    encryptionOverhead: 0.15,
    networkLatency: 45,
    throughputUtilization: 0
  });

  // Track transfers by environment and type
  const [transferMetrics, setTransferMetrics] = useState<{[key: string]: {transferred: number, total: number}}>({});

  useEffect(() => {
    // Calculate total size across all filtered resources
    const totalSize = filteredResources.reduce((acc, resource) => {
      const sizeValue = parseFloat(resource.metadata.size.replace(/[^0-9.]/g, ''));
      const sizeUnit = resource.metadata.size.replace(/[0-9.]/g, '').toUpperCase();
      const multiplier = sizeUnit.includes('TB') ? 1024 * 1024 * 1024 * 1024 :
                        sizeUnit.includes('GB') ? 1024 * 1024 * 1024 :
                        sizeUnit.includes('MB') ? 1024 * 1024 :
                        sizeUnit.includes('PB') ? 1024 * 1024 * 1024 * 1024 * 1024 : 1024;
      return acc + (sizeValue * multiplier);
    }, 0);
    
    setTransferStatus(prev => ({ ...prev, totalBytes: totalSize }));
  }, [filteredResources]);

  // Comprehensive transfer orchestration
  const startTransfer = async () => {
    setIsTransferring(true);
    let totalBytesTransferred = 0;
    const totalTransferSize = transferStatus.totalBytes;

    // Transfer resources in dependency order (infrastructure first)
    const transferOrder = ['network', 'security', 'storage', 'compute', 'database', 'application', 'backup', 'device', 'legacy', 'development'];
    
    for (const resourceType of transferOrder) {
      const resourcesOfType = filteredResources.filter(r => r.type === resourceType);
      
      for (const resource of resourcesOfType) {
        setCurrentResource(resource);
        
        // Calculate resource size in bytes
        const sizeValue = parseFloat(resource.metadata.size.replace(/[^0-9.]/g, ''));
        const sizeUnit = resource.metadata.size.replace(/[0-9.]/g, '').toUpperCase();
        const multiplier = sizeUnit.includes('TB') ? 1024 * 1024 * 1024 * 1024 :
                          sizeUnit.includes('GB') ? 1024 * 1024 * 1024 :
                          sizeUnit.includes('MB') ? 1024 * 1024 :
                          sizeUnit.includes('PB') ? 1024 * 1024 * 1024 * 1024 * 1024 : 1024;
        const resourceBytes = sizeValue * multiplier;
        
        let resourceBytesTransferred = 0;
        let errorCount = 0;
        
        // Simulate protocol-specific transfer behavior
        const protocol = resource.metadata.protocol || 'TCP';
        const chunkSize = protocol.includes('HTTP') ? 1024 * 1024 * 10 : // 10MB for HTTP
                          protocol.includes('SSH') ? 1024 * 1024 * 5 :   // 5MB for SSH
                          protocol.includes('FC') ? 1024 * 1024 * 50 :   // 50MB for Fibre Channel
                          1024 * 1024 * 20; // 20MB default
        
        while (resourceBytesTransferred < resourceBytes) {
          await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));
          
          const increment = Math.min(
            resourceBytes - resourceBytesTransferred,
            chunkSize + Math.random() * chunkSize * 0.5 // Variable chunk sizes
          );
          
          // Simulate occasional transfer errors
          if (Math.random() < 0.05 && errorCount < 2) { // 5% chance of error, max 2 errors
            errorCount++;
            const error: TransferError = {
              id: `err-${Date.now()}`,
              timestamp: new Date().toISOString(),
              resourceId: resource.id,
              severity: 'warning',
              message: `Network timeout on ${resource.name} - retrying`,
              resolution: 'Automatic retry in 3 seconds',
              retryCount: errorCount
            };
            
            setTransferStatus(prev => ({
              ...prev,
              errors: [...prev.errors, error]
            }));
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Retry delay
            continue;
          }
          
          resourceBytesTransferred += increment;
          totalBytesTransferred += increment;
          
          const speed = `${Math.round(increment / (1024 * 1024))} MB/s`;
          const remainingBytes = totalTransferSize - totalBytesTransferred;
          const avgSpeed = totalBytesTransferred / ((Date.now() - (Date.now() - 60000)) / 1000);
          const estimatedSeconds = Math.round(remainingBytes / avgSpeed);
          const hours = Math.floor(estimatedSeconds / 3600);
          const minutes = Math.floor((estimatedSeconds % 3600) / 60);
          const seconds = estimatedSeconds % 60;
          
          const compressionRatio = 1.0 + (Math.random() * 0.4); // 1.0-1.4x compression
          const packetsTransferred = Math.floor(totalBytesTransferred / 1500); // Assuming 1500 byte packets
          const totalPackets = Math.floor(totalTransferSize / 1500);
          
          setTransferStatus({
            bytesTransferred: totalBytesTransferred,
            totalBytes: totalTransferSize,
            speed,
            estimatedTimeRemaining: hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`,
            errors: transferStatus.errors,
            packetsTransferred,
            totalPackets,
            compressionRatio,
            encryptionOverhead: 0.1 + Math.random() * 0.1,
            networkLatency: 30 + Math.random() * 30,
            throughputUtilization: Math.min(95, 60 + Math.random() * 35)
          });
        }

        setCompletedResources((prev) => [...prev, resource]);
        
        // Update metrics by environment
        const env = resource.metadata.environment;
        setTransferMetrics(prev => ({
          ...prev,
          [env]: {
            transferred: (prev[env]?.transferred || 0) + resourceBytes,
            total: (prev[env]?.total || 0) + resourceBytes
          }
        }));
      }
    }

    setIsTransferring(false);
    setCurrentResource(null);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  const getProgress = () => {
    if (!currentResource) return 0;
    return (transferStatus.bytesTransferred / transferStatus.totalBytes) * 100;
  };

  const canProceed = completedResources.length === filteredResources.length;

  return (
    <div className="space-y-6">
      {/* Environment and Resource Type Filters */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Transfer Configuration</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Environment Selection */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Target Environments</h4>
            <div className="grid grid-cols-2 gap-2">
              {environments.map(env => (
                <label key={env.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedEnvironments.includes(env.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEnvironments(prev => [...prev, env.id]);
                      } else {
                        setSelectedEnvironments(prev => prev.filter(id => id !== env.id));
                      }
                    }}
                    className="text-sirsi-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{env.name}</div>
                    <div className="text-xs text-gray-500">{env.region} • {env.compliance.join(', ')}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Resource Type Filter */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Resource Types</h4>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Resource Types ({comprehensiveResources.length})</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({comprehensiveResources.filter(r => r.type === type).length})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Transfer Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredResources.length}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Resources Selected</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatBytes(transferStatus.totalBytes)}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Total Data Size</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{selectedEnvironments.length}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Target Environments</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{transferStatus.estimatedTimeRemaining}</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Estimated Duration</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Enterprise Infrastructure Transfer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive migration of {filteredResources.length} infrastructure components across {selectedEnvironments.length} environments
            </p>
          </div>
          <button
            onClick={startTransfer}
            disabled={isTransferring || filteredResources.length === 0}
            className="rounded-md bg-sirsi-500 px-6 py-3 text-white hover:bg-sirsi-600 disabled:opacity-50 font-medium"
          >
            {isTransferring ? 'Transferring...' : `Start Transfer (${filteredResources.length} resources)`}
          </button>
        </div>
      </div>
      
      {/* Detailed Transfer Metrics */}
      {isTransferring && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-lg font-medium mb-4">Real-Time Transfer Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{transferStatus.speed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Transfer Speed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{transferStatus.throughputUtilization.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bandwidth Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{transferStatus.compressionRatio.toFixed(1)}x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Compression Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{transferStatus.networkLatency.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Network Latency</div>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress: {formatBytes(transferStatus.bytesTransferred)} / {formatBytes(transferStatus.totalBytes)}</span>
              <span>{Math.round((transferStatus.bytesTransferred / transferStatus.totalBytes) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-sirsi-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((transferStatus.bytesTransferred / transferStatus.totalBytes) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

        {/* Resource List */}
        <div className="space-y-4">
          {resources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const isCompleted = completedResources.find((r) => r.id === resource.id);
            const isCurrent = currentResource?.id === resource.id;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 text-sirsi-500" />
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resource.metadata.type} • {resource.metadata.size}
                      </p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Loader className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {isCurrent && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatBytes(transferStatus.bytesTransferred)} of{' '}
                        {formatBytes(transferStatus.totalBytes)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{transferStatus.speed}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <motion.div
                        className="h-full rounded-full bg-sirsi-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${getProgress()}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Estimated time remaining: {transferStatus.estimatedTimeRemaining}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Transfer Summary */}
      {completedResources.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Transfer Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold">{completedResources.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resources Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold">
                {formatBytes(
                  completedResources.reduce(
                    (acc, r) => acc + parseInt(r.metadata.size) * 1024 * 1024 * 1024,
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Data Transferred</div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="text-2xl font-bold text-green-500">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {transferStatus.errors.length > 0 && (
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Transfer Warnings</h4>
          </div>
          <ul className="mt-2 list-inside list-disc text-sm text-yellow-700 dark:text-yellow-300">
            {transferStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('TransferStep: Continue to Validation clicked');
            console.log('TransferStep: canProceed:', canProceed);
            console.log('TransferStep: completed resources:', completedResources.length, 'of', resources.length);
            
            // Force all transfers to complete if needed for demo
            if (!canProceed) {
              console.log('TransferStep: Forcing transfer completion for demo');
              setCompletedResources(resources);
              setIsTransferring(false);
              setCurrentResource(null);
            }
            
            // Always proceed to next step
            console.log('TransferStep: Calling onComplete...');
            try {
              const artifact = {
                name: 'Transfer Execution Log',
                type: 'LOG',
                size: '12.3 MB',
                content: `# Transfer Execution Log\n\nGenerated on: ${new Date().toISOString()}\n\nCompleted Resources:\n${completedResources.map(r => `- ${r.name}: transferred`).join('\n')}`
              };
              onComplete(artifact);
              console.log('TransferStep: onComplete called successfully');
            } catch (error) {
              console.error('TransferStep: Error calling onComplete:', error);
            }
          }}
          disabled={false} // Always enabled for demo
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 text-lg px-8 py-4 font-bold"
        >
          Continue to Validation
        </button>
      </div>
    </div>
  );
};
