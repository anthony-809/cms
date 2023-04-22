import db from "cms/lib/db.server"
import bcrypt from "bcrypt"
import type { RequestEvent,CreateUserFunc } from "."

// TODO: update asset on any linked data
export default async function handleFunc(event:RequestEvent,funcInputData:any,json:Function) {
    const inputData:CreateUserFunc['input'] = funcInputData
    const funcData = inputData.data
    // check if user with this email exists
    const usersCol = db.collection("_users")
    const emailUserExists = await usersCol.findOne({ email:funcData.email })
    if(emailUserExists){
        const response:CreateUserFunc['output'] = {
            ok:false,
            msg:`User with email:${funcData.email} already exists`
        }
        return json(response)
    }
    // Hash password and create user
    const password = await bcrypt.hash(funcData.password,10)
    funcData['password'] = password
    const insertedUser = await usersCol.insertOne(funcData)
    if(insertedUser.acknowledged){
        const response:CreateUserFunc['output'] = {
            ok:true,
            msg:`User with email:${funcData.email} was created`,
            data:{ ...funcData,_id:insertedUser.insertedId }
        }
        return json(response)
    }
    // else something went wrong
    const response:CreateUserFunc['output'] = {
        ok:false,
        msg:"Something went wrong"
    }
    return json(response)
}