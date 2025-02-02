// eco impact routes and tracking

const mongoose = require("mongoose");

const impactSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    carbonFootprint: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["kg", "g"],
        default: "kg",
      },
    },
    waterUsage: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["L", "mL"],
        default: "L",
      },
    },
    energyConsumption: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["kWh", "Wh"],
        default: "kWh",
      },
    },
    recycledMaterials: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      materials: [
        {
          name: String,
          percentage: Number,
        },
      ],
    },
    sustainabilityCertifications: [
      {
        name: String,
        issuingBody: String,
        validUntil: Date,
        verificationUrl: String,
      },
    ],
    manufacturingLocation: {
      country: String,
      distance: {
        value: Number,
        unit: {
          type: String,
          enum: ["km", "mi"],
          default: "km",
        },
      },
    },
    packagingDetails: {
      type: {
        type: String,
        enum: ["biodegradable", "recyclable", "reusable", "conventional"],
      },
      materials: [
        {
          name: String,
          recyclable: Boolean,
          biodegradableTime: Number, // in months
        },
      ],
    },
    endOfLifeImpact: {
      recyclability: {
        type: Number,
        min: 0,
        max: 100,
      },
      biodegradability: {
        type: Number,
        min: 0,
        max: 100,
      },
      disposalInstructions: String,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for frequent queries
impactSchema.index({ product: 1 });
impactSchema.index({ verificationStatus: 1 });
impactSchema.index({ "carbonFootprint.value": 1 });

// Virtual for total environmental score
impactSchema.virtual("environmentalScore").get(function () {
  let score = 0;

  // Calculate score based on various factors
  score += (100 - this.carbonFootprint.value) * 0.3;
  score += (100 - this.waterUsage.value) * 0.2;
  score += this.recycledMaterials.percentage * 0.2;
  score +=
    (this.endOfLifeImpact.recyclability +
      this.endOfLifeImpact.biodegradability) *
    0.15;

  return Math.round(score);
});

// Methods
impactSchema.methods.getVerificationStatus = async function () {
  const verificationDetails = await this.populate("verifiedBy").execPopulate();
  return {
    status: this.verificationStatus,
    verifier: verificationDetails.verifiedBy
      ? verificationDetails.verifiedBy.name
      : null,
    date: this.verificationDate,
  };
};

const Impact = mongoose.model("Impact", impactSchema);
module.exports = Impact;
