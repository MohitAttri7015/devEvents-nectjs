import { Schema, model, models, Document } from 'mongoose';

//Event TypeScript interface
//extends Document Adds MongoDB fields like _id, .save(), etc.
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}


// Create Event Schema
const EventSchema = new Schema<IEvent>(
    {
        title: { 
            type: String, 
            required: true, 
            trim: true, 
            maxlength: [100, 'Title cannot exceed 100 characters'] 
        },
        slug: { 
            type: String, 
            unique: true, 
            lowercase: true, 
            trim: true 
        },
        description: { 
            type: String, 
            required: [true, 'Description is required'], 
            trim: true,
            minlength: [1000, 'Description must be at least 1000 characters long'] 
        },
        overview: { 
            type: String, 
            required: [true, 'Overview is required'], 
            trim: true,
            minlength: [500, 'Overview must be at least 500 characters long']
        },
        image: { 
            type: String, 
            required: [true, 'Image url is required'],
            trim: true 
        },
        venue: { 
            type: String, 
            required: [true, 'Venue is required'],
            trim: true 
        },
        location: { 
            type: String, 
            required: [true, 'Location is required'],
            trim: true 
        },
        date: { 
            type: String, 
            required: [true, 'Date is required'] 
        },
        time: { 
            type: String, 
            required: [true, 'Time is required'] 
        },
        mode: { 
            type: String, 
            required: [true, 'Mode is required'],
            // Can only be Online, Offline, Hybrid
            enum:{
                values: ['Online', 'Offline', 'Hybrid'],
                message: 'Mode must be either Online, Offline, or Hybrid'
            } 
        },
        audience:{
            type: String,
            required: [true, 'Audience is required'],
            trim: true
        },
        agenda:{
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'Agenda must have at least one item'
            }
        },
        organizer:{
            type: String,
            required: [true, 'Organizer is required'],
            trim: true
        },
        tags:{
            type: [String],
            required: [true, 'Tags are required'],
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'There must be at least one tag'
            }
        },
    }, 
    {
        timestamps: true,
    }
);


//Pre save hook (middleware) to generate slug from title
EventSchema.pre('save', function (next){
    // Access current event
    // this = current event being saved
    const event = this as IEvent;

    //Generate slug only if the title is modified or slug is new
    if(event.isModified('title') || event.isNew){
        event.slug = generateSlug(event.title);
    }

    //Normalize date to iso format
    if(event.isModified('date')) {
        event.date = normalizeDate(event.date);
    }

    //Normalize time to iso format
    if(event.isModified('time')){
        event.time = normalizeTime(event.time);
    }


    next();
});



//Helper function to generate slug form the title
function generateSlug(title: string): string{
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')
};


//Helper function to normalize date to ISO format (YYYY-MM-DD)
function normalizeDate(dateString: string): string {
    const date = new  Date(dateString);
    if(isNaN(date.getTime())){
        throw new Error('Invalid date format');
    }
    return date.toISOString().split('T')[0]; //Return only the date part
}


//Helper function to normalize time to ISO format (HH:MM:SS)
function normalizeTime(timeString: string): string {
    const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
    const match = timeString.trim().match(timeRegex);

    if(!match){
        throw new Error('Invalid time format');
    }

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[4]?.toUpperCase();

    if(period){
        if(period === 'PM' && hours < 12){
            hours += 12;
        }
        if(period === 'AM' && hours === 12){
            hours = 0;
        }
    }

    if(hours < 0 || hours > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59){
        throw new Error('Invalid time value');
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}



//Index on slug
EventSchema.index({slug: 1}, {unique: true});


// Create model safely
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;