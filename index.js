const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfa2q3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const appointmentsCollection = client
      .db("appointments")
      .collection("appointments");

    // appointments api start from here

    app.get("/appointments", async (req, res) => {
      const cursor = appointmentsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

  app.post("/appointments", async (req, res) => {
    const appointment = req.body;
    const existingAppointment = await appointmentsCollection.findOne({
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    });

    if (existingAppointment) {
      return res.status(400).send({ message: "Slot already booked!" });
    }

    const result = await appointmentsCollection.insertOne(appointment);
    res.send(result);
  });


    app.get("/available-slots", async (req, res) => {
      const slots = ["4:00 – 5:00", "5:00 – 6:00", "6:00 – 7:00"];

      try {
        // Fetch all booked slots
        const bookedSlots = await appointmentsCollection
          .find()
          .project({ timeSlot: 1 })
          .toArray();

        const bookedSlotTimes = bookedSlots.map((s) => s.timeSlot);
        const availableSlots = slots.filter(
          (slot) => !bookedSlotTimes.includes(slot)
        );

        res.send(availableSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("app is running fine");
});
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
