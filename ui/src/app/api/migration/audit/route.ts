import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auditEvent = await request.json();
    
    // Simulate storing audit event to backend
    console.log('Storing audit event:', auditEvent);
    
    // Add server-side metadata
    const enrichedEvent = {
      ...auditEvent,
      id: auditEvent.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: auditEvent.timestamp || new Date().toISOString(),
      source: 'migration-ui',
      sessionId: 'session-' + Math.random().toString(36).substr(2, 9),
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent'),
    };

    return NextResponse.json({
      success: true,
      data: {
        eventId: enrichedEvent.id,
        stored: true,
        timestamp: enrichedEvent.timestamp
      }
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store audit event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventType = searchParams.get('eventType');
    
    // Simulate retrieving audit events from backend
    const mockEvents = [
      {
        id: 'evt-001',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        eventType: 'migration',
        action: 'user_agreement_approved',
        resourceType: 'migration_plan',
        userId: 'user-001',
        userName: 'john.doe@company.com',
        success: true,
        details: { agreementStatus: 'approved' },
        source: 'migration-ui',
        sessionId: 'session-001',
        ipAddress: '10.0.0.1'
      },
      {
        id: 'evt-002',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        eventType: 'security',
        action: 'security_protocols_validated',
        resourceType: 'security_protocols',
        success: true,
        details: { securityStatus: 'all_protocols_active' },
        source: 'migration-ui',
        sessionId: 'session-001',
        ipAddress: '10.0.0.1'
      },
      {
        id: 'evt-003',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        eventType: 'migration',
        action: 'asset_discovery_completed',
        resourceType: 'discovered_assets',
        success: true,
        details: { assetCount: 15, discoveryTime: '2.3s' },
        source: 'migration-ui',
        sessionId: 'session-001',
        ipAddress: '10.0.0.1'
      }
    ];

    // Filter by event type if specified
    const filteredEvents = eventType 
      ? mockEvents.filter(event => event.eventType === eventType)
      : mockEvents;

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents.slice(0, limit),
        total: filteredEvents.length,
        pagination: {
          limit,
          offset: 0,
          hasMore: filteredEvents.length > limit
        }
      }
    });

  } catch (error) {
    console.error('Audit retrieval API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit events' },
      { status: 500 }
    );
  }
}
