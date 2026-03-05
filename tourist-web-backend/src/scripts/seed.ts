import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/user.model.js";
import District from "../models/district.model.js";
import Place from "../models/place.model.js";
import Scenic from "../models/scenic.model.js";
import Order from "../models/order.model.js";
import PurchasedDistrict from "../models/purchasedDistrict.model.js";

const DB_URI = process.env.DB_URI as string;

async function seed() {
  await mongoose.connect(DB_URI);
  console.log("Connected to DB");

  // --- Test User ---
  let testUser = await User.findOne({ email: "test@indiannarrated.com" });
  if (!testUser) {
    // User pre-save hook will hash the password automatically
    testUser = await User.create({
      name: "Test User",
      email: "test@indiannarrated.com",
      password: "Test@1234",
      isTestUser: true,
    });
    console.log("Created test user:", testUser.email);
  } else {
    // Ensure isTestUser is set
    if (!testUser.isTestUser) {
      await User.findByIdAndUpdate(testUser._id, { isTestUser: true });
    }
    console.log("Test user already exists:", testUser.email);
  }

  // --- District: Agra ---
  let agra = await District.findOne({ name: "Agra" });
  if (!agra) {
    agra = await District.create({
      name: "Agra",
      description: {
        en: "Agra is a city on the banks of the Yamuna river in Uttar Pradesh. It is home to the Taj Mahal, one of the Seven Wonders of the World.",
        hi: "आगरा उत्तर प्रदेश में यमुना नदी के किनारे स्थित एक शहर है। यह ताजमहल का घर है, जो दुनिया के सात अजूबों में से एक है।",
      },
      imageUrl: "districts/agra/cover.jpg",
      amount: 199,
      state: "Uttar Pradesh",
    });
    console.log("Created district: Agra");
  } else {
    console.log("District Agra already exists");
  }

  // --- District: Varanasi ---
  let varanasi = await District.findOne({ name: "Varanasi" });
  if (!varanasi) {
    varanasi = await District.create({
      name: "Varanasi",
      description: {
        en: "Varanasi is one of the oldest living cities in the world and is considered one of the holiest cities in Hinduism. It is situated on the banks of the Ganges river.",
        hi: "वाराणसी दुनिया के सबसे पुराने जीवित शहरों में से एक है और हिंदू धर्म में सबसे पवित्र शहरों में से एक माना जाता है। यह गंगा नदी के किनारे स्थित है।",
      },
      imageUrl: "districts/varanasi/cover.jpg",
      amount: 249,
      state: "Uttar Pradesh",
    });
    console.log("Created district: Varanasi");
  } else {
    console.log("District Varanasi already exists");
  }

  // --- Places and Scenics for Agra ---

  // Taj Mahal
  let tajMahal = await Place.findOne({ name: "Taj Mahal", districtID: agra._id });
  if (!tajMahal) {
    tajMahal = await Place.create({
      districtID: agra._id,
      name: "Taj Mahal",
      description: {
        en: "The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan.",
        hi: "ताजमहल आगरा में यमुना नदी के दाहिने किनारे पर स्थित एक हाथीदांत-सफेद संगमरमर का मकबरा है। इसे 1632 में मुगल सम्राट शाहजहाँ ने बनवाया था।",
      },
      imageUrl: "places/taj-mahal/cover.jpg",
      order: 1,
      amount: 99,
    });
    console.log("Created place: Taj Mahal");
  }

  const tajMahalScenics = [
    { name: "Entry Gate & First View", order: 1, description: { en: "The iconic gateway that offers the first breathtaking view of the Taj Mahal.", hi: "प्रतिष्ठित प्रवेश द्वार जो ताजमहल का पहला अद्भुत दृश्य प्रदान करता है।" } },
    { name: "Main Mausoleum", order: 2, description: { en: "The central white marble structure containing the tombs of Shah Jahan and Mumtaz Mahal.", hi: "केंद्रीय सफेद संगमरमर संरचना जिसमें शाहजहाँ और मुमताज महल की कब्रें हैं।" } },
    { name: "Charbagh Garden", order: 3, description: { en: "The formal Mughal garden divided into four quadrants, symbolizing the four rivers of paradise.", hi: "औपचारिक मुगल उद्यान जो चार भागों में विभाजित है, स्वर्ग की चार नदियों का प्रतीक।" } },
    { name: "Mosque (Masjid)", order: 4, description: { en: "The red sandstone mosque built to the west of the main mausoleum, used for Friday prayers.", hi: "मुख्य मकबरे के पश्चिम में बना लाल बलुआ पत्थर की मस्जिद, जो जुमे की नमाज के लिए उपयोग की जाती थी।" } },
  ];

  for (const sd of tajMahalScenics) {
    const exists = await Scenic.findOne({ placeID: tajMahal._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: tajMahal._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/taj-mahal/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/taj-mahal/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/taj-mahal/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // Agra Fort
  let agraFort = await Place.findOne({ name: "Agra Fort", districtID: agra._id });
  if (!agraFort) {
    agraFort = await Place.create({
      districtID: agra._id,
      name: "Agra Fort",
      description: {
        en: "Agra Fort is a UNESCO World Heritage Site. The fort was the main residence of the emperors of the Mughal Dynasty until 1638.",
        hi: "आगरा किला एक यूनेस्को विश्व धरोहर स्थल है। यह किला 1638 तक मुगल वंश के सम्राटों का मुख्य निवास था।",
      },
      imageUrl: "places/agra-fort/cover.jpg",
      order: 2,
      amount: 79,
    });
    console.log("Created place: Agra Fort");
  }

  const agraFortScenics = [
    { name: "Amar Singh Gate", order: 1, description: { en: "The main entrance gate of Agra Fort, named after Amar Singh, son of Maharana Pratap.", hi: "आगरा किले का मुख्य प्रवेश द्वार, महाराणा प्रताप के पुत्र अमर सिंह के नाम पर रखा गया।" } },
    { name: "Diwan-i-Aam", order: 2, description: { en: "The Hall of Public Audience where the emperor held court for the general public.", hi: "सार्वजनिक दर्शक हॉल जहाँ सम्राट आम जनता के लिए दरबार लगाते थे।" } },
    { name: "Jahangiri Mahal", order: 3, description: { en: "The largest private residential palace in Agra Fort, built by Emperor Akbar for his son Jahangir.", hi: "आगरा किले में सबसे बड़ा निजी आवासीय महल, जिसे सम्राट अकबर ने अपने पुत्र जहाँगीर के लिए बनवाया था।" } },
  ];

  for (const sd of agraFortScenics) {
    const exists = await Scenic.findOne({ placeID: agraFort._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: agraFort._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/agra-fort/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/agra-fort/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/agra-fort/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // Fatehpur Sikri
  let fatehpur = await Place.findOne({ name: "Fatehpur Sikri", districtID: agra._id });
  if (!fatehpur) {
    fatehpur = await Place.create({
      districtID: agra._id,
      name: "Fatehpur Sikri",
      description: {
        en: "Fatehpur Sikri is a UNESCO World Heritage Site. It was built by Mughal Emperor Akbar in the 16th century and served as the empire's capital.",
        hi: "फतेहपुर सीकरी एक यूनेस्को विश्व धरोहर स्थल है। इसे 16वीं शताब्दी में मुगल सम्राट अकबर ने बनवाया था और यह साम्राज्य की राजधानी के रूप में कार्य करता था।",
      },
      imageUrl: "places/fatehpur-sikri/cover.jpg",
      order: 3,
      amount: 79,
    });
    console.log("Created place: Fatehpur Sikri");
  }

  const fatehpurScenics = [
    { name: "Buland Darwaza", order: 1, description: { en: "The Gate of Magnificence, the highest gateway in the world, built to commemorate Akbar's victory over Gujarat.", hi: "भव्यता का द्वार, दुनिया का सबसे ऊँचा प्रवेश द्वार, जो गुजरात पर अकबर की जीत की याद में बनाया गया था।" } },
    { name: "Panch Mahal", order: 2, description: { en: "A five-story palatial structure with 176 columns, built for Emperor Akbar's relaxation.", hi: "176 स्तंभों वाला पाँच मंजिला महल, जो सम्राट अकबर के विश्राम के लिए बनाया गया था।" } },
    { name: "Salim Chishti's Tomb", order: 3, description: { en: "The marble tomb of the Sufi saint Sheikh Salim Chishti, famous for its intricate marble jali work.", hi: "सूफी संत शेख सलीम चिश्ती की संगमरमर की कब्र, अपने जटिल संगमरमर जाली काम के लिए प्रसिद्ध।" } },
  ];

  for (const sd of fatehpurScenics) {
    const exists = await Scenic.findOne({ placeID: fatehpur._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: fatehpur._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/fatehpur-sikri/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/fatehpur-sikri/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/fatehpur-sikri/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // --- Places and Scenics for Varanasi ---

  // Kashi Vishwanath
  let kashiVishwanath = await Place.findOne({ name: "Kashi Vishwanath Temple", districtID: varanasi._id });
  if (!kashiVishwanath) {
    kashiVishwanath = await Place.create({
      districtID: varanasi._id,
      name: "Kashi Vishwanath Temple",
      description: {
        en: "The Kashi Vishwanath Temple is one of the most famous Hindu temples dedicated to Lord Shiva. It is located in Vishwanath Gali of Varanasi.",
        hi: "काशी विश्वनाथ मंदिर भगवान शिव को समर्पित सबसे प्रसिद्ध हिंदू मंदिरों में से एक है। यह वाराणसी की विश्वनाथ गली में स्थित है।",
      },
      imageUrl: "places/kashi-vishwanath/cover.jpg",
      order: 1,
      amount: 99,
    });
    console.log("Created place: Kashi Vishwanath Temple");
  }

  const kashiScenics = [
    { name: "Main Entrance", order: 1, description: { en: "The grand entrance to the Kashi Vishwanath Temple complex.", hi: "काशी विश्वनाथ मंदिर परिसर का भव्य प्रवेश द्वार।" } },
    { name: "Garbhagriha (Sanctum)", order: 2, description: { en: "The inner sanctum housing the Jyotirlinga of Lord Shiva.", hi: "भगवान शिव के ज्योतिर्लिंग वाला गर्भगृह।" } },
    { name: "Nandi Mandap", order: 3, description: { en: "The hall with the sacred Nandi bull, the vehicle of Lord Shiva.", hi: "पवित्र नंदी बैल वाला मंडप, भगवान शिव का वाहन।" } },
  ];

  for (const sd of kashiScenics) {
    const exists = await Scenic.findOne({ placeID: kashiVishwanath._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: kashiVishwanath._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/kashi-vishwanath/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/kashi-vishwanath/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/kashi-vishwanath/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // Dashashwamedh Ghat
  let dashGhat = await Place.findOne({ name: "Dashashwamedh Ghat", districtID: varanasi._id });
  if (!dashGhat) {
    dashGhat = await Place.create({
      districtID: varanasi._id,
      name: "Dashashwamedh Ghat",
      description: {
        en: "Dashashwamedh Ghat is the main ghat in Varanasi on the Ganges, located close to Vishwanath Temple. The Ganga Aarti performed here is world-famous.",
        hi: "दशाश्वमेध घाट वाराणसी में गंगा नदी पर मुख्य घाट है, जो विश्वनाथ मंदिर के पास स्थित है। यहाँ होने वाली गंगा आरती विश्व प्रसिद्ध है।",
      },
      imageUrl: "places/dashashwamedh-ghat/cover.jpg",
      order: 2,
      amount: 79,
    });
    console.log("Created place: Dashashwamedh Ghat");
  }

  const dashScenics = [
    { name: "Ghat Steps", order: 1, description: { en: "The ancient stone steps leading down to the holy Ganges river.", hi: "पवित्र गंगा नदी तक जाने वाली प्राचीन पत्थर की सीढ़ियाँ।" } },
    { name: "Evening Aarti Spot", order: 2, description: { en: "The sacred spot where the grand Ganga Aarti ceremony takes place every evening.", hi: "पवित्र स्थान जहाँ हर शाम भव्य गंगा आरती समारोह होता है।" } },
  ];

  for (const sd of dashScenics) {
    const exists = await Scenic.findOne({ placeID: dashGhat._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: dashGhat._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/dashashwamedh-ghat/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/dashashwamedh-ghat/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/dashashwamedh-ghat/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // Sarnath
  let sarnath = await Place.findOne({ name: "Sarnath", districtID: varanasi._id });
  if (!sarnath) {
    sarnath = await Place.create({
      districtID: varanasi._id,
      name: "Sarnath",
      description: {
        en: "Sarnath is the deer park where Gautama Buddha first taught the Dharma after attaining enlightenment. It is one of the four major Buddhist pilgrimage sites.",
        hi: "सारनाथ वह हिरण उद्यान है जहाँ गौतम बुद्ध ने ज्ञान प्राप्ति के बाद पहली बार धर्म की शिक्षा दी थी। यह चार प्रमुख बौद्ध तीर्थस्थलों में से एक है।",
      },
      imageUrl: "places/sarnath/cover.jpg",
      order: 3,
      amount: 79,
    });
    console.log("Created place: Sarnath");
  }

  const sarnathScenics = [
    { name: "Dhamek Stupa", order: 1, description: { en: "A massive stupa built in 500 CE to mark the spot where the Buddha delivered his first sermon.", hi: "500 ईस्वी में बना एक विशाल स्तूप, उस स्थान को चिह्नित करता है जहाँ बुद्ध ने अपना पहला उपदेश दिया था।" } },
    { name: "Ashoka Pillar", order: 2, description: { en: "The famous lion capital of the Ashoka Pillar, now the national emblem of India.", hi: "अशोक स्तंभ का प्रसिद्ध सिंह शीर्ष, जो अब भारत का राष्ट्रीय प्रतीक है।" } },
    { name: "Mulagandha Kuti Vihar", order: 3, description: { en: "A Buddhist temple built in 1931 housing beautiful frescoes depicting scenes from the Buddha's life.", hi: "1931 में बना एक बौद्ध मंदिर जिसमें बुद्ध के जीवन के दृश्यों को दर्शाने वाले सुंदर भित्तिचित्र हैं।" } },
  ];

  for (const sd of sarnathScenics) {
    const exists = await Scenic.findOne({ placeID: sarnath._id, name: sd.name });
    if (!exists) {
      await Scenic.create({
        placeID: sarnath._id,
        name: sd.name,
        description: sd.description,
        order: sd.order,
        imageUrl: `scenics/sarnath/${sd.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
        audios: [
          { language: "english", s3Key: `scenics/sarnath/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/english.mp3` },
          { language: "hindi", s3Key: `scenics/sarnath/${sd.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}/hindi.mp3` },
        ],
      });
      console.log(`  Created scenic: ${sd.name}`);
    }
  }

  // --- Grant test user access to Agra + Varanasi ---
  for (const [district, label] of [[agra, "Agra"], [varanasi, "Varanasi"]] as const) {
    const exists = await PurchasedDistrict.findOne({ userID: testUser._id, districtID: district._id });
    if (!exists) {
      // Create a mock order
      const mockOrder = await Order.create({
        userID: testUser._id,
        districtID: district._id,
        amount: district.amount,
        status: 1,
      });
      await PurchasedDistrict.create({
        userID: testUser._id,
        districtID: district._id,
        orderID: mockOrder._id,
      });
      console.log(`Granted test user access to ${label}`);
    } else {
      console.log(`Test user already has access to ${label}`);
    }
  }

  console.log("\nSeed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
