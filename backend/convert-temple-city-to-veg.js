const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

const vegConversions = [
  {
    oldName: 'Chicken Fried Rice',
    newName: 'Vegetable Fried Rice',
    price: 100,
    description: 'Flavorful fried rice with fresh mixed vegetables, soy sauce and aromatic spices',
    image: 'https://www.shutterstock.com/image-photo/vegetable-fried-rice-260nw-1764071782.jpg',
    isVeg: true
  },
  {
    oldName: 'Butter Chicken',
    newName: 'Paneer Butter Masala',
    price: 140,
    description: 'Soft paneer cubes cooked in rich, creamy tomato-based gravy with butter and aromatic spices',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    isVeg: true
  },
  {
    oldName: 'Chicken Lollipop (6 Pcs)',
    newName: 'Veg Spring Rolls (6 Pcs)',
    price: 100,
    description: 'Crispy fried spring rolls filled with seasoned vegetables - a popular Indo-Chinese appetizer (6 pieces)',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    isVeg: true
  }
];

async function convertToVeg() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food-delivery');
    console.log('✅ Connected to database\n');
    console.log('🌱 Converting Temple City Cafe to Pure Veg Restaurant...\n');

    let updatedCount = 0;

    for (const conversion of vegConversions) {
      const result = await MenuItem.updateOne(
        { name: conversion.oldName },
        {
          $set: {
            name: conversion.newName,
            price: conversion.price,
            description: conversion.description,
            images: [conversion.image],
            isVeg: conversion.isVeg,
            category: conversion.isVeg ? 'Vegetarian' : 'Non-Vegetarian'
          }
        }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✓ ${conversion.oldName} → ${conversion.newName} (₹${conversion.price})`);
      } else {
        console.log(`⚠ ${conversion.oldName} not found`);
      }
    }

    console.log(`\n✅ Successfully converted ${updatedCount}/${vegConversions.length} items to vegetarian`);

    // Verify the conversions
    console.log('\n📋 Verification:');
    for (const conversion of vegConversions) {
      const item = await MenuItem.findOne({ name: conversion.newName });
      if (item) {
        console.log(`\n${item.name}:`);
        console.log(`  Price: ₹${item.price}`);
        console.log(`  Veg: ${item.isVeg ? 'Yes 🌱' : 'No'}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

convertToVeg();
