
const expenseSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    category: String,
    date: { type: Date, default: Date.now }
});
