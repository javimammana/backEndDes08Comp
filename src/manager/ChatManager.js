import { ChatModel } from "../models/chat.model.js";

class ChatManager {
    async getAllMessages() {
        return await ChatModel.find();
    }

    async sendMessage(data) {
        return await ChatModel.create(data);
    }
}

export default new ChatManager();