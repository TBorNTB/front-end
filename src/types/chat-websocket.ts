export type WebSocketMessageType = "JOIN" | "CHAT" | "CLOSE";

export interface WebSocketOutgoingMessage {
	type: WebSocketMessageType;
	roomId: string;
	content?: string;
	imageUrl?: string;
}

export interface WebSocketIncomingMessage {
	type: WebSocketMessageType;
	roomId: string;
	username: string;
	nickname: string;
	content?: string;
	imageUrl?: string | null;
	createdAt: string;
	serverId?: string;
}

export interface ChatMessage {
	id: string;
	sender: string;
	senderName: string;
	content?: string;
	imageUrl?: string | null;
	timestamp: Date;
	isOwn: boolean;
	type: "CHAT";
}
