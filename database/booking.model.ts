import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';


//Booking TypeScript interface
//extends Document Adds MongoDB fields like _id, .save(), etc.
export interface IBooking extends Document{
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}


// Create Booking Schema
const BookingSchema = new Schema<IBooking>({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: Event,
        required: [true, 'Event ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (email: string){
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            message: 'Please enter a valid email address'
        }
    }
},
{
    timestamps: true
}
)




//Pre-save hook (middleware) to check if the event is existing before saving a booking
BookingSchema.pre('save', async function(){
    // Access current document
    // this = the current booking document
    const booking = this as IBooking;

    // Check when validation should run
    // Run only when new booking or eventId is changed
    if(booking.isModified('eventId') || booking.isNew){
        try{
            // Check if event exists
            // select('_id') → optimized query (only fetch _id)
            const eventExists = await Event.findById(booking.eventId).select('_id');


            // If event doesn’t exist
            // Stops save operation
            // Throws validation error
            if(!eventExists){
                throw new Error('Event does not exist');
            }
        } catch{
            throw new Error('Error validating event ID')
        }
    }

});



// Find bookings of an event fast
BookingSchema.index({ eventId: 1 });
// Find latest bookings of an event fast
BookingSchema.index({ eventId: 1, createdAt: -1 });
// Find bookings of a user fast
BookingSchema.index({ email: 1 });

// Create model safely
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;