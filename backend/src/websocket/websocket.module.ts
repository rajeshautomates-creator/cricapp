// WebSocket Gateway for Real-time Score Updates
import { Module } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_match')
    handleJoinMatch(client: Socket, matchId: string) {
        client.join(`match:${matchId}`);
        console.log(`Client ${client.id} joined match ${matchId}`);
        return { event: 'joined_match', data: { matchId } };
    }

    @SubscribeMessage('leave_match')
    handleLeaveMatch(client: Socket, matchId: string) {
        client.leave(`match:${matchId}`);
        console.log(`Client ${client.id} left match ${matchId}`);
        return { event: 'left_match', data: { matchId } };
    }

    // Method to broadcast score updates
    emitScoreUpdate(matchId: string, scoreData: any) {
        this.server.to(`match:${matchId}`).emit('score_update', scoreData);
    }

    // Method to broadcast match status changes
    emitMatchStatusChange(matchId: string, status: string) {
        this.server.to(`match:${matchId}`).emit('match_status_change', { matchId, status });
    }
}

@Module({
    providers: [WebsocketGateway],
    exports: [WebsocketGateway],
})
export class WebsocketModule { }
