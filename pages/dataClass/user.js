import { nanoid } from "nanoid";

class User {
    constructor (username) {
        this.username = username;
        this.id = nanoid(6);
        this.score = 0;
        this.submitted = false
    }
}

export default User;