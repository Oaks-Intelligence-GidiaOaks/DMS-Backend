import mongoose from "mongoose";

import { Schema, model } from "mongoose";

const FormSchema = new Schema({
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  kerosene: {
    oneLitre: {
      price: Number,
    },
  },
  cookingGas: {
    twelveKg: {
      price: Number,
    },
  },
  fish: {
    oneFish: {
      type: String,
      price: Number,
    },
  },
  beef: {
    fivePieces: {
      price: Number,
    },
  },
  chicken: {
    oneKg: {
      price: Number,
    },
  },
  turkey: {
    oneKg: {
      price: Number,
    },
  },
  bread: {
    oneLoaf: {
      price: Number,
    },
  },
  egg: {
    crate: {
      price: Number,
    },
  },
  yam: {
    oneStandardSize: {
      price: Number,
    },
  },
  palmOil: {
    oneLitre: {
      price: Number,
    },
  },
  groundnutOil: {
    oneLitre: {
      price: Number,
    },
  },
  firewood: {
    oneBundle: {
      price: Number,
    },
  },
  charcoal: {
    oneBag: {
      amount: {
        type: String,
        enum: ["50 Kg", "100 Kg"],
      },
      price: Number,
    },
  },
  diesel: {
    oneLitre: {
      price: Number,
    },
  },
  petrol: {
    oneLitre: {
      price: Number,
    },
  },
  cement: {
    fiftyKgBag: {
      brand: {
        type: String,
        enum: ["Dangote", "Ibeto", "BUA"],
      },
      price: Number,
    },
  },
  buildingBlock: {
    size: {
      type: String,
      enum: ["6-inch", "9-inch", "Other"],
    },
    price: Number,
  },
  accommodationRentOneBedSelfContainPerYear: {
    price: Number,
  },
  accommodationRentTwoBedroomFlatPerYear: {
    price: Number,
  },
  accommodationRentThreeBedroomFlatPerYear: {
    price: Number,
  },
  accommodationRentDuplexPerYear: {
    price: Number,
  },
  routeOne: {
    route: String,
    modeOfTransport: {
      type: String,
      enum: ["Bike", "Keke", "Bus", "Other"],
    },
    transportCost: Number,
  },
  routeTwo: {
    route: String,
    modeOfTransport: {
      type: String,
      enum: ["Bike", "Keke", "Bus", "Other"],
    },
    transportCost: Number,
  },
  routeThree: {
    route: String,
    modeOfTransport: { type: String, enum: ["Bike", "Keke", "Bus", "Other"] },
    transportCost: Number,
  },
  governmentProject: { exists: Boolean, link: String },
  crimeReport: { exists: Boolean, link: String, details: String },
  accidentReport: { exists: Boolean, link: String, details: String },
});

export default model("Form", FormSchema)