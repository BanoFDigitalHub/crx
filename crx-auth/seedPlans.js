const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

const plans = [
  { name:"Bitcoin", image:"/images/bitcoin.png", totalInvestment:20, dailyAds:4, dailyProfit:2, totalProfit:180, durationDays:60 },
  { name:"Ethereum", image:"/images/ethereum.png", totalInvestment:50, dailyAds:10, dailyProfit:8, totalProfit:480, durationDays:60 },
  { name:"Tether (US)", image:"/images/tether.png", totalInvestment:100, dailyAds:20, dailyProfit:16, totalProfit:960, durationDays:60 },
  { name:"BNB", image:"/images/bnb.png", totalInvestment:200, dailyAds:40, dailyProfit:32, totalProfit:1920, durationDays:60 },
  { name:"Solana (SOL)", image:"/images/solana.png", totalInvestment:300, dailyAds:45, dailyProfit:64, totalProfit:3840, durationDays:60 },
  { name:"USD Coin", image:"/images/usd.png", totalInvestment:400, dailyAds:50, dailyProfit:128, totalProfit:7680, durationDays:60 },
  { name:"Dogecoin", image:"/images/doge.png", totalInvestment:500, dailyAds:60, dailyProfit:256, totalProfit:15360, durationDays:60 },
  { name:"TRON (TRX)", image:"/images/tron.png", totalInvestment:1000, dailyAds:120, dailyProfit:512, totalProfit:30720, durationDays:60 },
  { name:"Cardano (ADA)", image:"/images/ada.png", totalInvestment:1500, dailyAds:220, dailyProfit:1024, totalProfit:61440, durationDays:60 },
  { name:"Polkadot (DOT)", image:"/images/dot.png", totalInvestment:2000, dailyAds:300, dailyProfit:2048, totalProfit:122880, durationDays:60 },
  { name:"Litecoin (LTC)", image:"/images/ltc.png", totalInvestment:2500, dailyAds:400, dailyProfit:4096, totalProfit:245760, durationDays:60 },
  { name:"Stellen (XLM)", image:"/images/xlm.png", totalInvestment:3000, dailyAds:450, dailyProfit:8192, totalProfit:491520, durationDays:60 }
];

mongoose.connect(process.env.MONGO_URI)
.then(async ()=>{
  console.log('MongoDB connected');
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('Plans seeded successfully');
  process.exit(0);
})
.catch(err=>console.log(err));
