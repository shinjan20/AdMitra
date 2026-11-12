export interface SMBPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  city: string;
  area: string;
  websiteUrl: string;
  phone: string;
  whatsappNumber: string;
  instagramHandle: string;
  defaultObjective: 'leads' | 'messages' | 'awareness';
  recommendedInterests: string[];
  sampleCreatives: {
    headline: string;
    description: string;
    cta: 'Book Now' | 'Call Now' | 'Send WhatsApp Message' | 'Get Offer' | 'Learn More';
    imageUrl: string;
    imageAlt: string;
    primaryBenefit: string;
  }[];
}

export const INDIAN_SMB_PRESETS: SMBPreset[] = [
  {
    id: 'preset-salon-lucknow',
    name: 'Aura Bridal Studio & Luxury Salon',
    category: 'Beauty',
    description: 'Premier bridal makeup studio and beauty salon specializing in HD bridal makeovers, pre-wedding rituals, and customized skincare treatments.',
    city: 'Lucknow',
    area: 'Gomti Nagar & Hazratganj',
    websiteUrl: 'https://aurabridal.example.com',
    phone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    instagramHandle: '@aurabridalstudio',
    defaultObjective: 'messages',
    recommendedInterests: [
      'Bridal Makeup',
      'Wedding Planning',
      'Skin Care',
      'Hair Care & Styling',
      'Indian Ethnic Wear',
      'Jewellery Shopping',
    ],
    sampleCreatives: [
      {
        headline: 'Your Dream Bridal Look Starts Here',
        description: 'Explore bridal and pre-bridal makeup services. Ask about appointment availability and consultation options.',
        cta: 'Send WhatsApp Message',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Bridal makeup artist working with glowing traditional bridal jewellery',
        primaryBenefit: 'Pre-Bridal Consultation',
      },
      {
        headline: 'Shine on Your Special Day with Aura',
        description: 'Explore bridal makeup looks, HD makeup options, and personalized consultations.',
        cta: 'Book Now',
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Luxury salon interior and styling station',
        primaryBenefit: 'Personalized Consultation',
      },
      {
        headline: 'Festive & Party Makeup Packages',
        description: 'Explore makeup options for your next celebration. Ask about services and appointment availability.',
        cta: 'Send WhatsApp Message',
        imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Close-up flawless beauty portrait with natural lighting',
        primaryBenefit: 'Makeup for Celebrations',
      },
    ],
  },
  {
    id: 'preset-coaching-kota',
    name: 'Apex Scholars Academy',
    category: 'Education & Coaching',
    description: 'Specialized coaching institute for Class 9-12 CBSE, ICSE, and foundational JEE/NEET prep with small batch sizes and personal mentorship.',
    city: 'Bengaluru',
    area: 'HSR Layout & Koramangala',
    websiteUrl: 'https://apexscholars.example.com',
    phone: '+91 91234 56789',
    whatsappNumber: '+91 91234 56789',
    instagramHandle: '@apexscholarsacademy',
    defaultObjective: 'leads',
    recommendedInterests: [
      'CBSE Board Exams',
      'IIT-JEE Preparation',
      'NEET Entrance Exam',
      'High School Education',
      'Parenting & Children',
      'STEM Education',
    ],
    sampleCreatives: [
      {
        headline: 'Unlock Your Child’s True Academic Potential',
        description: 'Ask about course options, class schedules, and enrollment for the upcoming academic year.',
        cta: 'Book Now',
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Engaged students learning in modern classroom setting',
        primaryBenefit: 'Course Information',
      },
      {
        headline: 'Crack JEE & NEET with Confidence',
        description: 'Explore the institute’s courses and learning approach. Contact us for the syllabus or to arrange a visit.',
        cta: 'Learn More',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Student writing notes with study material and laptop',
        primaryBenefit: 'Syllabus and Course Details',
      },
      {
        headline: 'Struggling with Physics & Maths? We Can Help',
        description: 'Ask about physics and maths support. Speak with an academic mentor about course options.',
        cta: 'Call Now',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Tutor guiding student with interactive explanation',
        primaryBenefit: 'Academic Support',
      },
    ],
  },
  {
    id: 'preset-restaurant-delhi',
    name: 'Saffron & Spice Artisan Kitchen',
    category: 'Restaurant & Dining',
    description: 'Authentic Awadhi & North Indian dining restaurant serving wood-fired kebabs, slow-cooked biryanis, and curated mocktails in a royal ambience.',
    city: 'Delhi NCR',
    area: 'Connaught Place & Aerocity',
    websiteUrl: 'https://saffronandspice.example.com',
    phone: '+91 99887 76655',
    whatsappNumber: '+91 99887 76655',
    instagramHandle: '@saffronandspicekitchen',
    defaultObjective: 'awareness',
    recommendedInterests: [
      'Food & Dining',
      'Fine Dining',
      'Biryani Lovers',
      'Street Food & Kebabs',
      'Weekend Brunch',
      'Family Restaurants',
    ],
    sampleCreatives: [
      {
        headline: 'Experience {category} at {name}',
        description: 'Explore {category} options and dining experiences at {name}. Ask about the current menu or reserve a table.',
        cta: 'Book Now',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Warm and ambient fine-dining restaurant interior with cozy lighting',
        primaryBenefit: 'Dining Reservations',
      },
      {
        headline: 'Weekend Family Feast at {name}',
        description: 'Explore menu options for family dining at {name}. Ask about available seating and current offerings.',
        cta: 'Get Offer',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Appetizing Indian banquet dishes served on dining table',
        primaryBenefit: 'Family Dining',
      },
      {
        headline: 'Host Your Next Celebration With {name}',
        description: 'Private dining options at {name} for birthdays, anniversaries, and corporate dinners. Ask about custom set menus.',
        cta: 'Send WhatsApp Message',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Celebratory dining table with gourmet culinary presentation',
        primaryBenefit: 'Private Dining Options',
      },
    ],
  },
  {
    id: 'preset-fitness-mumbai',
    name: 'IronPulse Fitness & Strength Club',
    category: 'Fitness & Gym',
    description: 'High-energy 24/7 fitness club featuring Olympic barbells, functional CrossFit turf, certified personal trainers, and steam bath.',
    city: 'Mumbai',
    area: 'Andheri West & Bandra',
    websiteUrl: 'https://ironpulse.example.com',
    phone: '+91 97654 32109',
    whatsappNumber: '+91 97654 32109',
    instagramHandle: '@ironpulsefitness',
    defaultObjective: 'leads',
    recommendedInterests: [
      'Fitness & Bodybuilding',
      'Weight Loss',
      'CrossFit & HIIT',
      'Personal Training',
      'Healthy Living',
      'Yoga & Wellness',
    ],
    sampleCreatives: [
      {
        headline: 'Explore Fitness Options Near You',
        description: 'Ask about gym facilities, training options, and membership availability.',
        cta: 'Get Offer',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Modern gym interior with free weights and workout machines',
        primaryBenefit: 'Membership Information',
      },
      {
        headline: 'Beat The Excuse. Start Today.',
        description: 'Explore workout options and class schedules. Contact us to ask about membership plans.',
        cta: 'Book Now',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Athlete training in strength gym with dumbells',
        primaryBenefit: 'Workout Options',
      },
      {
        headline: 'Chat With Our Head Coach on WhatsApp',
        description: 'Have specific fitness goals? Contact a coach to discuss training options before joining.',
        cta: 'Send WhatsApp Message',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Fitness trainer guiding client with exercise technique',
        primaryBenefit: 'Talk With a Coach',
      },
    ],
  },
];

export const INDIAN_CITIES = [
  'Lucknow',
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Chandigarh',
  'Indore',
  'Chennai',
  'Surat',
  'Kochi',
];
