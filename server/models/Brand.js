// brand managment, operations and analytics

const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Brand description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    logo: {
      type: String,
      required: [true, "Brand logo is required"],
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        "Please provide a valid URL",
      ],
    },
    sustainabilityMetrics: {
      carbonNeutral: Boolean,
      recyclablePackaging: Boolean,
      sustainableMaterials: Boolean,
      fairTrade: Boolean,
      organicCertified: Boolean,
    },
    certifications: [
      {
        name: String,
        issuingBody: String,
        validUntil: Date,
        documentUrl: String,
      },
    ],
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    verificationDocuments: [
      {
        type: String,
        documentType: String,
        uploadDate: Date,
      },
    ],
    averageRating: {
      type: Number,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Indexes
brandSchema.index({ name: 1 });
brandSchema.index({ owner: 1 });
brandSchema.index({ status: 1 });

module.exports = mongoose.model("Brand", brandSchema);
