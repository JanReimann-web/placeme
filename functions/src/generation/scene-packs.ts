import type {
  DestinationKey,
  ImageCount,
  OccasionKey,
  SceneDescriptor,
  TravelStyleKey,
} from "./types";

const destinationLabels: Record<DestinationKey, string> = {
  "new-york": "New York",
  paris: "Paris",
  tokyo: "Tokyo",
  dubai: "Dubai",
  custom: "Custom brief",
};

const styleLabels: Record<TravelStyleKey, string> = {
  "casual-travel": "Casual Travel",
  "premium-elegant": "Premium Elegant",
  romantic: "Romantic",
  "family-travel": "Family Travel",
};

const occasionLabels: Record<OccasionKey, string> = {
  none: "No special moment",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
  christmas: "Christmas",
  "new-year": "New Year's Eve",
  birthday: "Birthday",
  wedding: "Wedding guest",
  anniversary: "Anniversary",
  business: "Business trip",
  "red-carpet": "Red carpet",
};

const occasionPromptHints: Record<OccasionKey, string> = {
  none: "No explicit season or event styling; keep the scene timeless and broadly usable.",
  spring: "Use spring atmosphere: fresh daylight, early greenery, soft colors, and light seasonal styling.",
  summer: "Use summer atmosphere: warm sunlight, lighter wardrobe, relaxed travel energy, and believable seasonal details.",
  autumn: "Use autumn atmosphere: layered styling, warmer tones, crisp light, and subtle seasonal foliage where appropriate.",
  winter: "Use winter atmosphere: cool light, refined cold-weather styling, coats or knits, and realistic winter surroundings.",
  christmas: "Use a premium Christmas mood: tasteful festive lights, warm interiors or city decorations, no cartoon props, no costume look.",
  "new-year": "Use a New Year's Eve mood: polished evening styling, celebration energy, subtle sparkle, city lights, and tasteful party context.",
  birthday: "Use a birthday celebration context: tasteful dinner, hotel lounge, flowers, cake, or subtle celebration details when natural.",
  wedding: "Use wedding guest context: elegant formal styling, refined venue details, and realistic social-event atmosphere.",
  anniversary: "Use anniversary context: understated romance, dinner, flowers, candlelight, or intimate travel moments without exaggeration.",
  business: "Use business travel context: polished workwear, hotel lobby, airport, conference, rooftop meeting, or refined city commute.",
  "red-carpet": "Use red carpet context: formal arrival, press-line energy, elegant styling, controlled flash lighting, and premium afterparty atmosphere.",
};

const scenePacks: Record<DestinationKey, SceneDescriptor[]> = {
  "new-york": [
    { key: "times_square", title: "Times Square", description: "Confident city arrival with bright billboards and layered pedestrians.", wardrobeHint: "Smart city layers and clean sneakers." },
    { key: "central_park", title: "Central Park", description: "Morning stroll on a tree-lined path with soft natural light.", wardrobeHint: "Relaxed coat, knitwear, or tonal casualwear." },
    { key: "brooklyn_bridge", title: "Brooklyn Bridge", description: "Windy bridge portrait with skyline depth and cinematic perspective.", wardrobeHint: "Structured outerwear with movement." },
    { key: "yellow_cab_street", title: "Yellow Cab Street", description: "Street-level crosswalk scene with classic New York taxi color.", wardrobeHint: "Refined travel basics with statement jacket." },
    { key: "rooftop_skyline", title: "Rooftop Skyline", description: "Golden-hour rooftop portrait overlooking the Manhattan skyline.", wardrobeHint: "Elevated evening travel styling." },
    { key: "coffee_shop_moment", title: "Coffee Shop Moment", description: "Editorial cafe scene with a quiet table and polished candid framing.", wardrobeHint: "Textured knit, trench, or tonal neutrals." },
    { key: "subway_scene", title: "Subway Scene", description: "Clean transit portrait with realistic station energy and motion.", wardrobeHint: "Modern commuter styling with layered basics." },
    { key: "evening_city_walk", title: "Evening City Walk", description: "Soft blue-hour walk through lit storefront streets.", wardrobeHint: "Evening coat and understated accessories." },
    { key: "museum_steps", title: "Museum Steps", description: "Architectural portrait at grand stone steps with editorial symmetry.", wardrobeHint: "Tailored separates with crisp lines." },
    { key: "west_village_corner", title: "West Village Corner", description: "Quiet brownstone block with lifestyle street-style framing.", wardrobeHint: "Soft luxury casualwear." },
    { key: "hotel_lobby_arrival", title: "Hotel Lobby Arrival", description: "Premium hotel check-in mood with luggage and warm lighting.", wardrobeHint: "Smart travel layers and leather details." },
    { key: "high_line_sunset", title: "High Line Sunset", description: "Sunset promenade view with urban greenery and skyline depth.", wardrobeHint: "Polished relaxed set with muted tones." },
  ],
  paris: [
    { key: "eiffel_tower", title: "Eiffel Tower", description: "Iconic morning portrait with subtle tower framing and elegant distance.", wardrobeHint: "Soft tailoring and understated neutrals." },
    { key: "paris_cafe", title: "Paris Cafe", description: "Outdoor cafe moment with coffee, marble table, and quiet street charm.", wardrobeHint: "Refined knitwear or lightweight blazer." },
    { key: "seine_riverside", title: "Seine Riverside", description: "Walking portrait beside the river with classic stone textures.", wardrobeHint: "Trench or softly layered citywear." },
    { key: "louvre_courtyard", title: "Louvre Courtyard", description: "Architectural frame with clean geometry and premium travel polish.", wardrobeHint: "Crisp monochrome or elegant tailoring." },
    { key: "paris_street_style", title: "Paris Street Style", description: "Fashion-led side street portrait with editorial posture and calm movement.", wardrobeHint: "Tailored silhouette with effortless accessories." },
    { key: "balcony_moment", title: "Balcony Moment", description: "Classic Parisian balcony scene with city rooftops and soft morning light.", wardrobeHint: "Silk textures, relaxed shirt, or elegant knit." },
    { key: "evening_lights", title: "Evening Lights", description: "Blue-hour city lights with reflective pavement and romantic tone.", wardrobeHint: "Dark outerwear with elevated evening feel." },
    { key: "garden_walk", title: "Garden Walk", description: "Natural stroll through manicured Paris gardens with relaxed composition.", wardrobeHint: "Soft neutrals and comfortable polished layers." },
    { key: "bookshop_scene", title: "Bookshop Scene", description: "Quiet literary moment with curated shelves and warm interior glow.", wardrobeHint: "Textured knit or elegant coat." },
    { key: "montmartre_steps", title: "Montmartre Steps", description: "Layered hillside steps with cafe energy and cinematic depth.", wardrobeHint: "City-chic separates with subtle contrast." },
    { key: "river_bridge_evening", title: "River Bridge Evening", description: "Romantic bridge view with soft light and intimate framing.", wardrobeHint: "Evening-ready layers with warm neutrals." },
    { key: "gallery_entry", title: "Gallery Entry", description: "Quiet gallery doorway with refined lifestyle composition.", wardrobeHint: "Minimal premium styling." },
  ],
  tokyo: [
    { key: "shibuya_crossing", title: "Shibuya Crossing", description: "Dynamic city portrait with motion blur and controlled street energy.", wardrobeHint: "Sharp streetwear with clean structure." },
    { key: "neon_street", title: "Neon Street", description: "Night scene with vibrant signage and polished cinematic color.", wardrobeHint: "Modern layered dark tones." },
    { key: "quiet_alley", title: "Quiet Alley", description: "Calmer side street portrait with lantern detail and intimate framing.", wardrobeHint: "Minimal city styling and textured layers." },
    { key: "city_viewpoint", title: "City Viewpoint", description: "High-rise observation portrait with expansive skyline depth.", wardrobeHint: "Premium casualwear with refined fit." },
    { key: "train_station_scene", title: "Train Station Scene", description: "Transit moment with realistic platform atmosphere and symmetry.", wardrobeHint: "Clean commuter layers and compact accessories." },
    { key: "cafe_scene", title: "Cafe Scene", description: "Contemporary cafe portrait with warm wood and focused composition.", wardrobeHint: "Relaxed monochrome or tonal basics." },
    { key: "shopping_district", title: "Shopping District", description: "Lifestyle walk through a curated retail street with energetic framing.", wardrobeHint: "Editorial casual with sleek outerwear." },
    { key: "evening_tokyo_walk", title: "Evening Tokyo Walk", description: "Blue-hour stroll with balanced neon reflections and grounded realism.", wardrobeHint: "Layered night-out citywear." },
    { key: "temple_entry", title: "Temple Entry", description: "Quiet cultural scene with warm wood, stone paths, and stillness.", wardrobeHint: "Understated travel pieces with calm palette." },
    { key: "rooftop_bar", title: "Rooftop Bar", description: "Polished evening portrait with skyline lights and premium hospitality detail.", wardrobeHint: "Elevated evening styling." },
    { key: "arcade_scene", title: "Arcade Scene", description: "Playful but composed travel moment with color and urban depth.", wardrobeHint: "Contemporary street-inspired casualwear." },
    { key: "morning_market", title: "Morning Market", description: "Fresh daylight scene with subtle market textures and candid movement.", wardrobeHint: "Soft tailored basics with comfortable fit." },
  ],
  dubai: [
    { key: "downtown_skyline", title: "Downtown Skyline", description: "Polished arrival portrait with skyline depth and warm city light.", wardrobeHint: "Tailored travelwear with luxury finish." },
    { key: "desert_edge", title: "Desert Edge", description: "Soft sunset portrait at the city-desert boundary with warm sand tones.", wardrobeHint: "Flowing neutrals or refined resort styling." },
    { key: "marina_walk", title: "Marina Walk", description: "Waterfront lifestyle scene with modern towers and relaxed confidence.", wardrobeHint: "Premium casual with sunglasses or elegant accessories." },
    { key: "luxury_hotel_lobby", title: "Luxury Hotel Lobby", description: "High-end lobby portrait with architectural symmetry and soft gold light.", wardrobeHint: "Statement outerwear or elevated coordinated set." },
    { key: "palm_view", title: "Palm View", description: "Open-air terrace portrait with resort coastline atmosphere.", wardrobeHint: "Resort polish and light premium fabrics." },
    { key: "rooftop_evening", title: "Rooftop Evening", description: "Sunset rooftop composition with skyline glow and polished evening mood.", wardrobeHint: "Evening-ready tailoring or elegant dress code." },
    { key: "shopping_avenue", title: "Shopping Avenue", description: "Luxury retail walk with clean lines and lifestyle travel framing.", wardrobeHint: "Structured, premium casual wardrobe." },
    { key: "sunset_city_scene", title: "Sunset City Scene", description: "Golden-hour city portrait with warm shadows and reflective surfaces.", wardrobeHint: "Soft monochrome and sleek accessories." },
    { key: "beach_club_arrival", title: "Beach Club Arrival", description: "Refined seaside entrance moment with clean resort architecture.", wardrobeHint: "Modern resort wear with relaxed luxury." },
    { key: "courtyard_breakfast", title: "Courtyard Breakfast", description: "Morning dining scene with quiet luxury and soft desert light.", wardrobeHint: "Light linen or elevated daytime set." },
    { key: "museum_walk", title: "Museum Walk", description: "Architectural cultural scene with minimalist lines and soft shadows.", wardrobeHint: "Minimal polished layers." },
    { key: "night_fountain_view", title: "Night Fountain View", description: "Evening landmark portrait with water reflections and a premium finish.", wardrobeHint: "Dark evening palette with sleek lines." },
  ],
  custom: [
    { key: "signature_arrival", title: "Signature Arrival", description: "A clear establishing image that introduces the requested place, event, or situation.", wardrobeHint: "Match the user's requested dress code and keep styling believable." },
    { key: "hero_portrait", title: "Hero Portrait", description: "Premium portrait with the subject as the unmistakable focal point.", wardrobeHint: "Use the most iconic outfit direction from the custom brief." },
    { key: "environment_walk", title: "Environment Walk", description: "Natural movement through the requested environment with realistic surroundings.", wardrobeHint: "Keep clothing practical for the scene while preserving the desired mood." },
    { key: "close_candid", title: "Close Candid", description: "Closer candid frame with authentic expression and strong identity retention.", wardrobeHint: "Keep accessories consistent with the reference photos and brief." },
    { key: "social_moment", title: "Social Moment", description: "A believable interaction or public moment that fits the requested story.", wardrobeHint: "Coordinate wardrobe with any companion or pet in the frame." },
    { key: "detail_scene", title: "Detail Scene", description: "Editorial detail moment that adds context without losing the subject.", wardrobeHint: "Show scene-specific accessories only when they support the request." },
    { key: "wide_context", title: "Wide Context", description: "Wider composition that shows the setting while keeping the subject readable.", wardrobeHint: "Use a silhouette that remains clear at distance." },
    { key: "premium_lifestyle", title: "Premium Lifestyle", description: "A polished lifestyle frame with magazine-quality posture and lighting.", wardrobeHint: "Elevate the styling while staying faithful to the custom idea." },
    { key: "backstage_moment", title: "Behind-the-Scenes Moment", description: "A quieter secondary scene that makes the story feel lived-in.", wardrobeHint: "Use relaxed styling that still matches the main scene." },
    { key: "evening_scene", title: "Evening Scene", description: "Night or evening variation with controlled highlights and realistic atmosphere.", wardrobeHint: "Shift to evening-appropriate styling if the brief allows it." },
    { key: "finale_frame", title: "Finale Frame", description: "A strong closing image that feels like the best shareable result from the set.", wardrobeHint: "Use the most refined version of the requested look." },
    { key: "alternate_angle", title: "Alternate Angle", description: "A fresh viewpoint of the same requested story to compare identity stability.", wardrobeHint: "Keep wardrobe continuity consistent with earlier frames." },
  ],
};

export function getDestinationLabel(destination: DestinationKey) {
  return destinationLabels[destination] ?? destination;
}

export function getStyleLabel(style: TravelStyleKey) {
  return styleLabels[style] ?? style;
}

export function getOccasionLabel(occasion: OccasionKey) {
  return occasionLabels[occasion] ?? occasion;
}

export function getOccasionPromptHint(occasion: OccasionKey) {
  return occasionPromptHints[occasion] ?? "";
}

export function getSceneSelection(
  destination: DestinationKey,
  imageCount: ImageCount,
) {
  return scenePacks[destination].slice(0, imageCount);
}
