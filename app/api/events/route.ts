import { v2 as cloudinary } from 'cloudinary';
import connectDb from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from '@/database/event.model'

export async function POST(req: NextRequest){
    try{
        await connectDb();

        const formData = await req.formData();
        let event;

        try{
            event = Object.fromEntries(formData.entries());
        } catch (e){
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 })    
        }

        const file = formData.get('image') as File;

        if(!file){
            return NextResponse.json({ message: 'Image is required' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DEV_EVENTS' }, (error, results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create(event);

        return NextResponse.json({ messae: 'Event created successfully', event: createdEvent }, { status: 201 });

    } catch (e){
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'unknown' }, { status: 400 })
    }
}



export async function GET(){
    try{

        await connectDb();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event fetched successfully', events }, { status: 200 });

    } catch(e){
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}