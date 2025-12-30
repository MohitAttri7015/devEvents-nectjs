import connectDb from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";


// Type for Route Params
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};



//creating a get function that must return a response
export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    try{
        await connectDb();

        // Get Slug from Params
        const { slug } = await params;

        // Validate Slug
        if(!slug || typeof slug !== 'string'){
            return NextResponse.json(
                { message: 'Invalid or missing slug parameter' },
                { status: 400 }
            )
        }

        //sanitizeSlug like removing space and all letters in lowercase
        const sanitizeSlug  = slug.trim().toLowerCase();

        //Query MongoDB to return single document using sanitizeSlug for query filter and using lean to retrun plane javascript faster
        const event = await Event.findOne({ slug: sanitizeSlug  }).lean();

        if(!event){
            return NextResponse.json(
                { message: `Event with slug ${sanitizeSlug } not found` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Event fethced successfully', event },
            { status: 200 }
        );

    } catch(error){
        return NextResponse.json(
            { message: 'Error while fetching event by slug', error: error },
            { status: 500 }
        )
    }
}