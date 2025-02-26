class Client {
    constructor(id, name, email, photo) {
      this.id = id;
      this.name = name;
      this.photo = photo;
    }
  
    getInfo() {
      return `ID: ${this.id}, Name: ${this.name}, Email: ${this.email}, Photo: ${this.photo}`;
    }
  
  }
  
export default Client;