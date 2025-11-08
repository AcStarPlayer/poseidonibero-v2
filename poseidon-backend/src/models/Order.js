import mongoose from "mongoose";

// 🧱 Esquema de los ítems del pedido
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    imageUrl: { type: String, default: "/uploads/default.jpg" },

    // 🧩 Varias tallas y cantidades
    sizes: [
      {
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    // 👇 Ya no necesitas "customization.size" aquí
    customization: {
      text: { type: String },
      imageUrl: { type: String },
      color: { type: String },
      notes: { type: String },
    },

    sku: { type: String },
    isPromo: { type: Boolean, default: false },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
  },
  { _id: false }
);

// 🚚 Dirección de envío
const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    address: { type: String },
    city: { type: String },
    phone: { type: String },
    postalCode: { type: String }, // 🆕 opcional para envíos más detallados
    country: { type: String, default: "Colombia" }, // 🆕 país por defecto
  },
  { _id: false }
);

// 📦 Esquema principal del pedido
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingSchema,
    paymentMethod: { type: String },
    totalPrice: { type: Number, required: true },

    // 💰 Subtotal y descuentos adicionales (por si se agregan en el futuro)
    subtotal: { type: Number },
    discountTotal: { type: Number, default: 0 },

    // 🔹 Estado del pedido
    status: {
      type: String,
      enum: ["Pendiente", "Enviado", "Entregado", "Cancelado", "Reembolsado"], // 🆕 más estados compatibles
      default: "Pendiente",
    },

    // 🧾 Código único autogenerado (ej: PED-0001)
    orderCode: {
      type: String,
      unique: true,
      index: true,
    },

    // 🕓 Fecha estimada de entrega (opcional)
    estimatedDelivery: { type: Date },

    // 📦 Información de envío externo (transportadora, guía, etc.)
    shippingInfo: {
      carrier: { type: String }, // 🆕 nombre de la transportadora
      trackingNumber: { type: String }, // 🆕 número de guía
      trackingUrl: { type: String }, // 🆕 enlace de rastreo
      status: { type: String }, // 🆕 estado de la entrega
    },

    // 🧾 Datos del pago
    paymentDetails: {
      transactionId: { type: String },
      paymentStatus: { type: String, default: "Pendiente" },
      amountPaid: { type: Number },
      method: { type: String }, // ejemplo: PayPal, Efectivo, etc.
    },

    // 🗒️ Observaciones internas del admin o del cliente
    notes: { type: String },

    // 🕓 Historial de cambios de estado
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        changedBy: { type: String }, // nombre o rol del usuario que lo modificó
      },
    ],
  },
  { timestamps: true }
);

// 🎯 Middleware: Generar código automático tipo PED-0001
orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastOrder = await mongoose
      .model("Order")
      .findOne()
      .sort({ createdAt: -1 });

    const lastCode = lastOrder?.orderCode
      ? parseInt(lastOrder.orderCode.split("-")[1])
      : 0;

    const newCode = String(lastCode + 1).padStart(4, "0");
    this.orderCode = `PED-${newCode}`;
    next();
  } catch (error) {
    console.error("❌ Error generando código de pedido:", error);
    next(error);
  }
});

export default mongoose.model("Order", orderSchema);
