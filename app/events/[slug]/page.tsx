import { notFound } from "next/navigation";
import Image from 'next/image'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);


const EventAgenda = ({ agendaItems }: { agendaItems: string[] } ) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)


const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-wrap flex-row gap-1.5">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)


const EventDetail = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const { event } = await request.json();

    if(!event) return notFound();

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p className="mt-2">{event.description}</p>
            </div>

            <div className="details">

                <div className="content">
                    <Image src={event.image} alt="Event Banner" width={800} height={800} className="banner"/>

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{event.overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={event.date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={event.time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="location" label={event.location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={event.mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={event.audience} />
                    </section>

                    <EventAgenda agendaItems={JSON.parse(event.agenda[0])} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{event.organizer}</p>
                    </section>

                    <EventTags tags={JSON.parse(event.tags[0])}/>
                </div>

                <aside className="booking">
                    <p className="text-lg font-semibold">Book Event</p>
                </aside>
            </div>
        </section> 
    )
}

export default EventDetail