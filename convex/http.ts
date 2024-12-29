import {httpRouter} from "convex/server"
import {httpAction} from './_generated/server'
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"
import {api,internal} from "./_generated/api"
import { request } from "http"
const http=httpRouter()

http.route({
    method: 'POST',
    path: '/lemon-squeezy-webhook',
    handler:httpAction(async(ctx,request)=>{
        const payloadString=await request.text()
        const signature=request.headers.get("X-Signature")

        if(!signature){
            throw new Response("Missing X signature in headers",{status:400})
        }

        try {
            const payload=await ctx.runAction(internal.lemonSqueezy.verifyWebhook,{
                payload:payloadString,
                signature
            })

            if(payload.meta.event_name==="order_created"){
                const {data}=payload
                const {success}=await ctx.runMutation(api.users.upgradeToPro,{
                    email:data.attributes.user_email,
                    lemonSqueezyCustomerId:data.attributes.customer_id.toString(),
                    lemonSqueezyOrderId:data.id,
                    amount:data.attributes.total
                })

                if(success){
                    //optionally do anything else
                }
            }
            return new Response("Webhook processed successfully",{status:200})

        } catch (error) {
            console.log("Webhook error: ", error)
            return new Response(`Error processing webhook: ${error}`,{status:500})
        }
    })
})

http.route({
    path:"/clerk-webhook",
    method:"POST",
    handler:httpAction(async(ctx,request)=>{
        const webhookSecret=process.env.CLERK_WEBHOOK_SECRET
        if(!webhookSecret){
            throw new Error("Missing CLERK_WEBHOOK_SECRET envoirment varibale!")
        }
        const svix_id=request.headers.get("svix-id")
        const svix_signature=request.headers.get("svix-signature")
        const svix_timestamp=request.headers.get("svix-timestamp")

        if(!svix_id || !svix_signature || !svix_timestamp){
            throw new Response("No svix_id or svix_signature in headers",{status:400})
        }

        const payload=await request.json()
        const body=JSON.stringify(payload)
        const wh= new Webhook(webhookSecret)
        let evt: WebhookEvent
        try{
            evt=wh.verify(body,{
                "svix-id":svix_id,
                "svix-timestamp":svix_timestamp,
                "svix-signature":svix_signature,
            }) as WebhookEvent
        } catch(err){
            console.log("Error verifying webhook signature",err)
            throw new Response("Invalid webhook signature",{status:400})
        }
        const eventType=evt.type
        if(eventType==="user.created"){
            //save user to convex database
            const {id,email_addresses,first_name,last_name}=evt.data
            const email=email_addresses[0].email_address
            const name=`${first_name || ""} ${last_name || ""}`.trim()
            try {
                //save user to database
                await ctx.runMutation(api.users.syncUser,{
                    userId:id,
                    email,
                    name,
                })
            } catch (error) {
                console.log(error)
                return new Response(`Error creating user: + ${error}`,{status:500})
            }
        }
        return new Response("Webhook processed successfully",{status:200})
    })
})

export default http