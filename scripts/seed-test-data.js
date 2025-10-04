import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    // Create sample category if not exists
    const category = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('✅ Category created:', category.name);
    }

    // Create sample products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        price: 999.99,
        sku: 'IPHONE15PRO-001',
        stock: 50,
        categoryId: category.id,
        images: ['https://example.com/iphone15pro-1.jpg', 'https://example.com/iphone15pro-2.jpg']
      },
      {
        name: 'MacBook Air M3',
        description: '13-inch MacBook Air with M3 chip, 8GB RAM, 256GB SSD',
        price: 1099.99,
        sku: 'MACBOOK-AIR-M3-001',
        stock: 25,
        categoryId: category.id,
        images: [
          'https://example.com/macbook-air-m3-1.jpg',
          'https://example.com/macbook-air-m3-2.jpg'
        ]
      },
      {
        name: 'AirPods Pro (3rd Gen)',
        description: 'Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio',
        price: 249.99,
        sku: 'AIRPODS-PRO-3GEN-001',
        stock: 100,
        categoryId: category.id,
        images: ['https://example.com/airpods-pro-3gen-1.jpg']
      }
    ];

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: productData,
        create: productData
      });
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(`✅ Product created: ${product.name} - $${product.price}`);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('🎉 Test data seeded successfully!');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('❌ Error seeding test data:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
