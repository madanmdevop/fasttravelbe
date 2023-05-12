import Booking from '../models/booking';
import cronJob, { ScheduledTask } from "node-cron";
import { Types } from 'mongoose';

let task: ScheduledTask;

const updateBookings = async ()=>{
    try {
        //Find all the bookings where status is IN_PROGRESS and scheduledCompletionTime as passed
        const bookings = await Booking.find({
            status:"IN_PROGRESS","scheduledCompletionTime":{$lte: (new Date()).toISOString()}
        },["_id"]);

        if(bookings.length > 0){
            for (let i = 0; i < bookings.length; i++) {
                const booking = bookings[i];
                await Booking.updateOne({
                    _id: (new Types.ObjectId(booking.id))
                },{status: "COMPLETED"});//{status: "COMPLETED"}
            }
        }else{
            //No progress bookings are present
        }
    } catch (error:any) {
        console.log("This is cron error",error.message)
    }
}

const cron = {
    async init(){
        console.log("Cron job initiated")
        task =  cronJob.schedule("0 */2 * * * *", function() {
            updateBookings();
        },{
            runOnInit:true
        });
        this.start();
    },
    start():void{
        task?.start();
    },
    stop():void{
        task?.stop();
    }
};

export default cron;