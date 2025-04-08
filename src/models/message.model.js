class Message {
  constructor(id, sender, text, timestamp, receiver, state) {
    this.id = id;
    this.senderId = sender;
    this.receiverId = receiver;
    this.text = text;
    this.timestamp = timestamp || new Date().toISOString();
    this.state = state || "sent";
  }

  getSummary() {
    return `Message from ${this.sender} at ${this.timestamp}: ${this.text}`;
  }

}

export default Message;
