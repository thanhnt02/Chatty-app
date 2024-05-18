import APIs from './APIs'
import Request from './request'
export default class User extends Request {

    static getDefault()
    {
        return {
            _id: 1,
            name: "",
            gender:1,
            address: "",
            email:"",
            phone:"",
            avatar:""
        }
    }

    static async login(email, password)
    {
        let result = await this.post(APIs.user.login, {
            email: email,
            password: password
        })
        return result
    }

    static async register(data)
    {
        let result = await this.post(APIs.user.register, data)
        return result
    }

    static async logout(id)
    {
        return await this.delete(APIs.user.logout+id)
    }
}