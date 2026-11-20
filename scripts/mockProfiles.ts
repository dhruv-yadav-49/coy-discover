export interface SeedProfile {
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
  likedCurrentUser: boolean; // 12 profiles with true, 20 with false
}

export const mockProfiles: SeedProfile[] = [
  // Cluster 1: Consecutive mutual likes (3 in a row -> tests Scenario 2: Consecutive Matches)
  {
    name: "Aarav Sharma",
    age: 23,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    bio: "Software developer who loves travelling, street food, and indie acoustic music. Always planning the next road trip.",
    city: "Bengaluru",
    interests: ["Coding", "Travel", "Music", "Photography"],
    likedCurrentUser: true, // Mutual Match #1
  },
  {
    name: "Priya Nair",
    age: 22,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bio: "Architecture student at CEPT. Coffee enthusiast, watercolor painter, and lover of heritage walks.",
    city: "Ahmedabad",
    interests: ["Design", "Coffee", "Art", "Architecture"],
    likedCurrentUser: true, // Mutual Match #2 (Consecutive!)
  },
  {
    name: "Ananya Iyer",
    age: 24,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    bio: "Fintech analyst & classical Bharatanatyam dancer. Weekend hiker and avid reader of suspense thrillers.",
    city: "Chennai",
    interests: ["Dance", "Finance", "Reading", "Hiking"],
    likedCurrentUser: true, // Mutual Match #3 (Consecutive!)
  },

  // Cluster 2: Consecutive non-mutual likes (3 in a row -> tests Scenario 1: Consecutive Non-Matches)
  {
    name: "Rohan Verma",
    age: 25,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Product designer by day, amateur chef by night. Looking for someone to test my homemade sourdough recipes on.",
    city: "Mumbai",
    interests: ["Cooking", "Design", "Fitness", "Podcasts"],
    likedCurrentUser: false, // Non-mutual #1
  },
  {
    name: "Kabir Mehta",
    age: 26,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    bio: "Founder of a sustainable fashion startup. Marathon runner, dog dad to a golden retriever named Bruno.",
    city: "Delhi NCR",
    interests: ["Startups", "Running", "Dogs", "Sustainability"],
    likedCurrentUser: false, // Non-mutual #2 (Consecutive!)
  },
  {
    name: "Vikram Malhotra",
    age: 27,
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    bio: "Aerospace engineer. Stargazer, sci-fi geek, and certified scuba diver. Let's debate interstellar travel.",
    city: "Hyderabad",
    interests: ["Astronomy", "Scuba Diving", "Sci-Fi", "Chess"],
    likedCurrentUser: false, // Non-mutual #3 (Consecutive!)
  },

  // Cluster 3: Pairs and mixed (tests Scenario 3: Alternating & Mixed)
  {
    name: "Diya Patel",
    age: 21,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    bio: "Psychology major. Big fan of retro rock, film photography, and board games on rainy weekends.",
    city: "Pune",
    interests: ["Music", "Photography", "Psychology", "Board Games"],
    likedCurrentUser: true, // Mutual Match #4
  },
  {
    name: "Meera Sen",
    age: 23,
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    bio: "Journalist covering culture and literature. Loves Kolkata book fairs, black coffee, and old-school jazz.",
    city: "Kolkata",
    interests: ["Writing", "Books", "Jazz", "Culture"],
    likedCurrentUser: true, // Mutual Match #5 (Consecutive!)
  },
  {
    name: "Arjun Reddy",
    age: 24,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "Data scientist. Passionate about Formula 1, mechanical keyboards, and brewing the perfect pour-over.",
    city: "Bengaluru",
    interests: ["Formula 1", "Data Science", "Coffee", "Tech"],
    likedCurrentUser: false, // Non-mutual #4
  },
  {
    name: "Sneha Mukherjee",
    age: 25,
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    bio: "UX researcher who believes good design makes people happier. Weekend pottery enthusiast and foodie.",
    city: "Gurugram",
    interests: ["UX Research", "Pottery", "Food", "Yoga"],
    likedCurrentUser: true, // Mutual Match #6
  },
  {
    name: "Siddharth Rao",
    age: 26,
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    bio: "Cloud architect and bouldering addict. Always looking for new crags to climb or techno gigs to attend.",
    city: "Bengaluru",
    interests: ["Climbing", "Cloud Tech", "Techno", "Camping"],
    likedCurrentUser: false,
  },
  {
    name: "Tanvi Kapoor",
    age: 22,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    bio: "Brand strategist & content creator. Obsessed with sunset picnics, thrifting vintage jackets, and podcasts.",
    city: "Mumbai",
    interests: ["Fashion", "Marketing", "Podcasts", "Travel"],
    likedCurrentUser: false, // Changed from true to test consecutive false
  },
  {
    name: "Aditya Deshmukh",
    age: 28,
    photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    bio: "Emergency room resident doctor. Balance chaos with classical piano, mountain biking, and good sushi.",
    city: "Mumbai",
    interests: ["Medicine", "Piano", "Cycling", "Sushi"],
    likedCurrentUser: true, // Changed from false to true
  },
  {
    name: "Ishita Roy",
    age: 23,
    photo: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80",
    bio: "Visual artist and botanical illustrator. Plant mom to 24 succulents and collector of vintage postcards.",
    city: "Jaipur",
    interests: ["Illustration", "Plants", "Art", "Vintage"],
    likedCurrentUser: true,
  },
  {
    name: "Varun Nair",
    age: 24,
    photo: "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80",
    bio: "Mobile app developer. Surfer whenever I am in Goa or Varkala. Can whip up the best South Indian filter coffee.",
    city: "Kochi",
    interests: ["Surfing", "Mobile Dev", "Coffee", "Swimming"],
    likedCurrentUser: false,
  },
  {
    name: "Natasha Fernandez",
    age: 25,
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    bio: "Sommelier in training & culinary explorer. Believes laughing over tapas is the ultimate therapy.",
    city: "Goa",
    interests: ["Wine", "Cooking", "Live Music", "Baking"],
    likedCurrentUser: true, // Will match if liked
  },
  {
    name: "Harsh Bansal",
    age: 27,
    photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
    bio: "Fintech product manager. Triathlete, chess enthusiast, and casual weekend DJ.",
    city: "Chandigarh",
    interests: ["Triathlon", "Product", "Chess", "Electronic Music"],
    likedCurrentUser: false,
  },
  {
    name: "Tara Joshi",
    age: 22,
    photo: "https://images.unsplash.com/photo-1524638431109-93d95c968f03?auto=format&fit=crop&w=800&q=80",
    bio: "Literature grad turned copywriter. Cat lover, tea purist, and collector of secondhand books.",
    city: "Dehradun",
    interests: ["Literature", "Writing", "Cats", "Tea"],
    likedCurrentUser: true, // Will match if liked
  },
  {
    name: "Naveen Goswami",
    age: 25,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    bio: "Environmental scientist working on clean rivers. Trekker, wildlife photographer, and acoustic guitarist.",
    city: "Rishikesh",
    interests: ["Environment", "Trekking", "Wildlife", "Guitar"],
    likedCurrentUser: false,
  },
  {
    name: "Rhea Singhania",
    age: 24,
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    bio: "Lawyer with a love for theatre and debate. Fluent in sarcasm, always down for late-night street food.",
    city: "Lucknow",
    interests: ["Theatre", "Law", "Street Food", "Debate"],
    likedCurrentUser: true, // Will match if liked
  },
  {
    name: "Karan Chopra",
    age: 26,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    bio: "Game developer & pixel artist. Can talk about game narrative design or Japanese anime for hours.",
    city: "Bengaluru",
    interests: ["Gaming", "Game Dev", "Anime", "Art"],
    likedCurrentUser: false,
  },
  {
    name: "Kavya Menon",
    age: 23,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    bio: "Biotech researcher discovering new enzymes. Baker of epic brownies, badminton player, and stargazing fan.",
    city: "Thiruvananthapuram",
    interests: ["Biotech", "Baking", "Badminton", "Science"],
    likedCurrentUser: true, // Will match if liked
  },
  {
    name: "Yashvardhan Kulkarni",
    age: 25,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Civil engineer working on high-speed rail. Amateur photographer and passionate motorcycle tourer.",
    city: "Nagpur",
    interests: ["Motorcycles", "Engineering", "Photography", "Road Trips"],
    likedCurrentUser: false,
  },
  {
    name: "Simran Kaur",
    age: 24,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bio: "Digital illustrator and UX designer. Constantly sketching coffee shop patrons and listening to indie pop.",
    city: "Amritsar",
    interests: ["Illustration", "Design", "Indie Pop", "Sketching"],
    likedCurrentUser: true, // Will match if liked
  },
  {
    name: "Aman Trivedi",
    age: 27,
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    bio: "Cybersecurity engineer by day, escape room solver by weekend. Passionate about cryptography and trivia nights.",
    city: "Indore",
    interests: ["Cybersecurity", "Trivia", "Board Games", "Tech"],
    likedCurrentUser: false,
  },
  {
    name: "Zoya Qureshi",
    age: 23,
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    bio: "Museum curator & history nerd. Exploring hidden monuments, learning Urdu poetry, and making pottery.",
    city: "Bhopal",
    interests: ["History", "Poetry", "Museums", "Pottery"],
    likedCurrentUser: false,
  },
  {
    name: "Devendra Choudhary",
    age: 26,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "Organic farm manager & agritech researcher. Loves soil science, making artisanal kombucha, and mountain trails.",
    city: "Udaipur",
    interests: ["Agritech", "Sustainability", "Hiking", "Fermentation"],
    likedCurrentUser: false,
  },
  {
    name: "Bhavna Mishra",
    age: 24,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    bio: "Speech therapist with a passion for sign language. Loves baking sourdough, singing choral music, and cats.",
    city: "Patna",
    interests: ["Singing", "Baking", "Linguistics", "Animals"],
    likedCurrentUser: false,
  },
  {
    name: "Pranav Pillai",
    age: 25,
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    bio: "Sound designer for indie video games. Synths collector, audiophile, and lover of nocturnal city walks.",
    city: "Kozhikode",
    interests: ["Sound Design", "Audio", "Gaming", "Night Walks"],
    likedCurrentUser: false,
  },
  {
    name: "Shreya Ghoshal-Das",
    age: 22,
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    bio: "Marine biology student studying coral reefs. Scuba instructor, ocean conservation advocate, and film photographer.",
    city: "Visakhapatnam",
    interests: ["Marine Biology", "Diving", "Ocean", "Photography"],
    likedCurrentUser: false,
  },
  {
    name: "Samarth Hegde",
    age: 27,
    photo: "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80",
    bio: "Robotics engineer building autonomous drones. Coffee brewer, rock climber, and lover of retro Japanese city pop.",
    city: "Mangaluru",
    interests: ["Robotics", "Drones", "Rock Climbing", "City Pop"],
    likedCurrentUser: false,
  },
  {
    name: "Alia Khan",
    age: 23,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    bio: "Fashion journalist and thrift stylist. Believes in slow fashion, vintage vinyl records, and authentic conversations.",
    city: "Jaipur",
    interests: ["Fashion", "Vintage", "Vinyl", "Writing"],
    likedCurrentUser: false,
  },
];
