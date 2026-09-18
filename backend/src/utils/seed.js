require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const ServiceCategory = require("../models/ServiceCategory");
const ProviderProfile = require("../models/ProviderProfile");
const Availability = require("../models/Availability");

const services = [
  [
    "Electrician",
    "electrician",
    "Wiring, fans, switches, fixtures and electrical repairs.",
    299,
  ],
  [
    "Plumber",
    "plumber",
    "Leak repair, taps, pipelines, sinks and bathroom plumbing.",
    249,
  ],
  [
    "Carpenter",
    "carpenter",
    "Furniture repair, assembly, doors and woodwork.",
    399,
  ],
  [
    "AC Repair",
    "ac-repair",
    "AC servicing, installation, gas refill and troubleshooting.",
    499,
  ],
  [
    "House Cleaning",
    "house-cleaning",
    "Deep cleaning, kitchen, bathroom and full-home cleaning.",
    699,
  ],
  ["Painter", "painter", "Interior/exterior painting and touch-up work.", 599],
  [
    "Appliance Repair",
    "appliance-repair",
    "Repair for refrigerators, washing machines and appliances.",
    349,
  ],
  ["Maid", "maid", "Regular household help and cleaning services.", 299],
];

const providers = [
  {
    name: "Rahul Kumar",
    email: "provider@gmail.com",
    phone: "9999999997",
    businessName: "Rahul Home Services",
    description:
      "Experienced professional providing electrical, AC and home maintenance services.",
    experience: 7,
    serviceSlugs: ["electrician", "ac-repair", "appliance-repair"],
    pricePerVisit: 399,
    address: "Boring Road, Patna, Bihar",
    city: "Patna",
    coordinates: [85.1376, 25.5941],
    rating: 4.8,
    totalReviews: 126,
  },

  {
    name: "Amit Sharma",
    email: "amit.provider@gmail.com",
    phone: "9999999996",
    businessName: "Amit Plumbing Solutions",
    description:
      "Professional plumbing specialist handling residential and commercial plumbing work.",
    experience: 6,
    serviceSlugs: ["plumber"],
    pricePerVisit: 299,
    address: "Kankarbagh, Patna, Bihar",
    city: "Patna",
    coordinates: [85.1588, 25.5877],
    rating: 4.6,
    totalReviews: 89,
  },

  {
    name: "Sanjay Kumar",
    email: "sanjay.provider@gmail.com",
    phone: "9999999995",
    businessName: "Sanjay Carpentry & Furniture",
    description:
      "Skilled carpenter specializing in furniture repair, assembly and custom woodwork.",
    experience: 9,
    serviceSlugs: ["carpenter", "painter"],
    pricePerVisit: 499,
    address: "Rajendra Nagar, Patna, Bihar",
    city: "Patna",
    coordinates: [85.1566, 25.6086],
    rating: 4.7,
    totalReviews: 103,
  },

  {
    name: "Priya Singh",
    email: "priya.provider@gmail.com",
    phone: "9999999994",
    businessName: "Priya Home Care Services",
    description:
      "Reliable professional for house cleaning, maid and household support services.",
    experience: 5,
    serviceSlugs: ["house-cleaning", "maid"],
    pricePerVisit: 599,
    address: "Patliputra Colony, Patna, Bihar",
    city: "Patna",
    coordinates: [85.0911, 25.6176],
    rating: 4.9,
    totalReviews: 147,
  },
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function seed() {
  try {
    await connectDB();

    // Seed Service Categories
    for (const [name, slug, description, basePrice] of services) {
      await ServiceCategory.updateOne(
        { slug },
        {
          $set: {
            name,
            slug,
            description,
            basePrice,
            isActive: true,
          },
        },
        { upsert: true },
      );
    }

    const serviceDocs = await ServiceCategory.find({
      slug: { $in: services.map((service) => service[1]) },
    });

    const serviceMap = {};

    serviceDocs.forEach((service) => {
      serviceMap[service.slug] = service._id;
    });


    // Password
    const password = await bcrypt.hash("Test@123", 10);

    // Admin
    await User.findOneAndUpdate(
      { email: "ashishanand858@gmail.com" },
      {
        $set: {
          name: "Ashish Anand",
          phone: "8051403975",
          password,
          role: "admin",
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

  
    // Customer
    await User.findOneAndUpdate(
      { email: "customer@gmail.com" },
      {
        $set: {
          name: "Demo Customer",
          phone: "9999999998",
          password,
          role: "customer",
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );


    // Service Providers
    for (const providerData of providers) {
      const providerUser = await User.findOneAndUpdate(
        { email: providerData.email },
        {
          $set: {
            name: providerData.name,
            phone: providerData.phone,
            password,
            role: "provider",
            isActive: true,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      const providerServices = providerData.serviceSlugs
        .map((slug) => serviceMap[slug])
        .filter(Boolean);

      const provider = await ProviderProfile.findOneAndUpdate(
        { user: providerUser._id },
        {
          $set: {
            businessName: providerData.businessName,
            description: providerData.description,
            experience: providerData.experience,
            services: providerServices,
            pricePerVisit: providerData.pricePerVisit,
            address: providerData.address,
            city: providerData.city,

            location: {
              type: "Point",
              coordinates: providerData.coordinates,
            },

            isVerified: true,
            rating: providerData.rating,
            totalReviews: providerData.totalReviews,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      // Provider Availability
      for (const day of days) {
        await Availability.updateOne(
          {
            provider: provider._id,
            day,
          },
          {
            $set: {
              startTime: "09:00",
              endTime: "19:00",
              isAvailable: true,
            },
          },
          {
            upsert: true,
          },
        );
      }
    }


    // Console Output
    console.log("\n====================================");
    console.log("      LocalFix Seed Complete");
    console.log("====================================\n");

    console.log("Admin");
    console.log("Email    : ashishanand858@gmail.com");
    console.log("Password : Test@123\n");

    console.log("Customer");
    console.log("Email    : customer@gmail.com");
    console.log("Password : Test@123\n");

    console.log("Service Providers");

    providers.forEach((provider) => {
      console.log(`${provider.name} → ${provider.email} / Test@123`);
    });

    console.log("\nServices seeded:", serviceDocs.length);
    console.log("Providers seeded:", providers.length);

    console.log("\n====================================\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
