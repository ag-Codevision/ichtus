distinctive design language built around near-black surfaces, electric orange accents, warm ivory sections, oversized geometric typography, sculptural 3D artwork, and tightly organized portfolios.
The production specification below translates that visual language into reusable design rules, CSS tokens, component architecture, interaction states, responsive layouts, accessibility requirements, and prompts for front-end coding agents.
Key fidelity rule: Reproduce the composition and contrast rhythm first. The metallic orange hero artwork, dark-to-light section transitions, and deliberately limited accent color are more important than decorative microdetails.
DESIGN.md — NOVACRAFT / Orange Graphite Creative Agency
Version: 1.0
Design family: Premium Digital Agency / Dark Editorial / Orange Sculptural
Reference: User-provided composite screenshot
Purpose: Production-grade visual specification for websites, landing pages, service pages, portfolios, and agency interfaces.
Evidence disclaimer: This specification is reverse-engineered from a compressed raster screenshot. Colors, typography, spacing, and dimensions are approximations, not verified original source-code values. Responsive layouts and interactive behavior are recommendations derived from the visible design language.


0. Executive Visual DNA
0.1 Design identity
The design combines five defining characteristics:
1. Near-black editorial foundations. Dark graphite backgrounds carry the hero, portfolio, process, pricing, and footer sections.
2. High-energy orange. A vibrant orange acts as the single branded accent, appearing in CTA buttons, selected cards, statistics, section markers, and the hero artwork.
3. Geometric grotesk typography. Large, tightly tracked white headings are paired with compact sans-serif supporting text.
4. Sculptural and photographic art direction. A dramatic bronze-orange metallic ribbon anchors the hero. Human-centered photography and detailed digital-product mockups establish credibility elsewhere.
5. Organized visual density. Grid-based cards, consistently rounded corners, compact metadata, and deliberate spacing create a high-information presentation without losing hierarchy.
0.2 North star
The website should feel like a premium product-design agency that combines creative experimentation with commercial credibility.
Visual formula:
Near-black canvas + warm ivory counterpoint + vivid orange signals + oversized white sans-serif headings + metallic 3D artwork + purposeful photography + structured cards.
0.3 Non-negotiable rules
- Use one dominant orange accent family.
- Preserve dark/light section alternation.
- Keep the hero headline dominant over every interface element.
- Use photography or high-quality product imagery in portfolio and agency sections.
- Maintain consistent rounded component geometry.
- Keep decorative effects concentrated in hero and CTA artwork.
- Use dense modular arrangements for projects, pricing, processes, and services.
- Make the highlighted card or CTA unmistakable without highlighting everything.

1. Reference Decomposition
1.1 Understanding the source composition
Observed: The source is a vertical visual board presenting two tall, narrow website compositions side by side.
The left composition includes:
- Header/navigation
- Hero with metallic orange ribbon
- Client-logo trust bar
- Light-background services section
- Dark impact/case-study module
- Testimonial
- Large orange contact CTA
The right composition includes:
- About section with photographic collage
- Featured-project gallery
- Five-step process
- Orange metrics band
- Three-tier pricing
- Final contact CTA
- Dark footer
Important: The side-by-side presentation is treated as a design showcase, not proof that the production website has a permanent sidebar or two-column page shell.
Recommended: Combine the demonstrated modules into a conventional full-width, vertically flowing website.
1.2 Observed visual inventory
Region	Visual treatment	Identity contribution
Header	Black, white links, orange button	Premium branded navigation
Hero	Massive headline, orange metal sculpture	Primary recognition
Trust strip	Inset charcoal panel, grayscale logos	Credibility
Services	Warm ivory, four cards	Visual contrast and clarity
Impact	Large charcoal panel, photography, statistics	Proof of expertise
Testimonials	Editorial quote and compact portrait	Human trust
Orange CTA	Saturated fill, white heading, dark action	Conversion
About	Black layout, offset photo collage	Agency personality
Projects	Two-column image-card gallery	Product craftsmanship
Process	Five compact dark steps	Methodology
Metrics	Continuous orange ribbon	Quantified credibility
Pricing	Dark cards, highlighted orange center	Commercial offer
Footer	Small navigation groups, dark background	Functional closure1.3 Hierarchy
The strongest eye-catching elements are:
1. Hero headline and metallic sculpture
2. Large orange CTA and statistics band
3. Product portfolio imagery
4. Large light/dark section transitions
5. Section headings
6. Supporting cards and metadata
Never promote small icons, paragraphs, dividers, or hover effects above these elements.
1.4 Confidence
- Observed, high: Color relationships, component families, image subjects, section contrast, approximate content hierarchy.
- Estimated, medium: Original UI dimensions, typography scale, padding, gutter sizes, corner radii.
- Inferred: True desktop breakpoint behavior, mobile navigation, scroll states, animation.
- Recommended: Accessible foreground colors, focus styling, error states, performance and implementation architecture.

2. Design Principles
Principle A — Dramatic but controlled
Use one strong visual focal point per major section.
The hero has the metallic sculpture. The impact section has team photography. The project section has application screenshots. The orange CTA has large graphic artwork.
Do not stack competing effects in the same region.
Principle B — Dark editorial contrast
Dark is the default environment, but the warm-ivory services area is an essential part of the identity.
Dark sections communicate sophistication and technical expertise. Light sections communicate approachability, usability, and service clarity.
Principle C — Accent by intention
Orange should communicate:
- Action
- Selection
- Importance
- Energy
- Brand recognition
It should not become the default color of all text or icons.
Principle D — Structured modularity
Cards share consistent:
- Rounded geometry
- Padding
- Typography
- Contrast treatment
- Interaction behavior
- Image cropping
Variation comes from content and emphasis, not random styling.
Principle E — Human plus digital
Pair interface mockups and abstract 3D art with real people collaborating.
The visual story is not purely technological; it connects technical output with human creative work.

3. Color System
3.1 Primary palette
Approximate reference-inspired values:
Token	HEX	Purpose
Deep black	#0B0C0D	Hero and deepest background
Primary charcoal	#111214	Standard dark section
Raised graphite	#1B1B1D	Cards and inset panels
Elevated graphite	#252527	Hover surfaces and layering
Warm ivory	#F7F5F2	Light-section foundation
Soft white	#FFFEFC	Service cards
White text	#F8F7F5	Dark-section headings
Dark text	#19191A	Light-section headings
Dark-muted text	#B4B1AE	Descriptions on dark
Light-muted text	#65615E	Descriptions on ivory
Brand orange	#FF650F	CTA, artwork, statistics
Bright orange	#FF781B	Highlights and hover
Deep orange	#B83C00	Accessible accent text on ivory
Metallic copper	#A95024	Image-art material referenceConfidence: Medium for the general palette, lower for precise HEX values.
3.2 Color distribution
For a full-page composition inspired by the screenshot:
- 65–75% dark or graphite surfaces.
- 20–30% ivory, white cards, and neutral media.
- 3–6% saturated orange as a visual signal on average.
- The remaining visual color comes primarily from photographs and project screenshots.
The orange proportion can be substantially higher in an individual CTA or metrics strip.
3.3 Orange placement rules
Allowed:
- Primary CTA
- Selected filter tab
- Featured pricing plan
- Section marker
- Small icon
- Important statistic block
- Signature hero sculpture
- Contact banner
- Hover emphasis
Avoid:
- Long paragraphs
- Every card title
- All navigation items
- Large generic background gradients
- Multiple unrelated accent palettes
- Low-contrast text on orange
3.4 Theme-specific semantics
Dark theme:
- Main heading: #F8F7F5
- Body: #B4B1AE
- Surface: #1B1B1D
- Border: white at approximately 8–12% opacity
- Active: #FF650F
Light theme:
- Main heading: #19191A
- Body: #65615E
- Surface: #FFFEFC
- Border: black at approximately 6–9% opacity
- Accent text: #B83C00
Accessibility tradeoff: Bright orange on ivory does not reliably provide sufficient contrast for small text. Use the darker accent-text token where required, retaining the bright brand orange for fills and decoration.
3.5 Orange surface treatment
Orange panels may use a small warm tonal gradient:
linear-gradient(115deg, #FF5D09 0%, #FF6B12 55%, #FA6B17 100%)
Do not introduce purple, blue, teal, or rainbow gradient backgrounds.

4. Typography
4.1 Typeface identification
The screenshot suggests a contemporary geometric or neo-grotesk sans-serif with:
- Large x-height
- Clean, relatively neutral letterforms
- Compact headline width
- Rounded but not excessively soft construction
- Heavy display weights
- Tight display tracking
- Clear, highly legible numerals
The original font cannot be verified from this raster reference.
4.2 Candidate typefaces
Preferred candidates to test:
1. Manrope — strong starting point for a unified design system.
2. Plus Jakarta Sans — slightly more geometric and approachable.
3. General Sans — strong editorial alternative, subject to availability and licensing.
4. Inter Tight — practical substitute for compact headings.
Choose one coherent primary family. Do not randomly mix these typefaces.
Recommended production setup:
- Display: Manrope 700–800
- Headings: Manrope 600–750
- Body: Manrope 400–500
- Navigation: Manrope 500–600
- Metadata: Manrope 600–700
Confidence: Medium for morphological category; low for exact font identification.
4.3 Typography roles
Role	Style	Weight	Tracking	Case
Hero	Heavy geometric grotesk	750–800	-0.055em	Sentence / title case
Section headline	Geometric sans	700	-0.04em	Sentence / title case
Card title	Sans	650–700	-0.025em	Sentence case
Body	Sans	400–500	-0.005em	Sentence case
Navigation	Sans	500–600	0	Title case
Eyebrow	Sans	700	0.055em	Uppercase
Metric	Sans, tabular numerals	700–800	-0.04em	Numeric
Button	Sans	650–700	-0.01em	Title case4.4 Display behavior
The reference uses expressive line breaking.
Example:
We Build
Digital Products
That Drive Results.
The orange accent is isolated to the word “Drive” or another strategically chosen term.
The line breaks are part of the composition. Preserve the intended rhythm at desktop sizes instead of allowing arbitrary wrapping.
Use responsive heading variants for smaller screens.

5. Type Scale
Recommended desktop production scale:
Token	Font size	Line height	Application
Display XL	80–96px	1.02–1.07	Hero
Display L	60–72px	1.05–1.1	Major campaign
Heading 1	48–60px	1.08–1.15	Major sections
Heading 2	36–44px	1.12–1.2	Section headings
Heading 3	24–30px	1.2–1.3	Large modules
Heading 4	18–22px	1.25–1.35	Card headings
Body L	17–18px	1.5–1.65	Intro copy
Body	15–16px	1.55–1.7	Standard copy
Body S	13–14px	1.5–1.6	Compact cards
Eyebrow	11–12px	1.4	Labels
Metadata	11–13px	1.4–1.5	Supporting UIExample implementation:
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.25rem, 5.8vw, 6rem);
  font-weight: 800;
  line-height: 1.055;
  letter-spacing: -0.055em;
}

.section-title {
  font-size: clamp(2.125rem, 3.3vw, 3.75rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.045em;
}
Mobile recommendation:
- Hero: 44–58px, adjusted for device width.
- Major headings: 30–42px.
- Card titles: 18–24px.
- Standard body: 15–16px.
These are implementation recommendations, not observed mobile values.

6. Spacing System
6.1 Rhythm extraction
The screenshot repeatedly shows:
- Narrow separations between small buttons and icons
- Moderate internal card padding
- Consistent gaps between repeated cards
- Larger gaps around section headlines
- Strong whitespace between major section groups
The precise original CSS spacing scale is not recoverable from the compressed image.
Recommended: Implement this inferred rhythm with a 4px base and stronger usage around 8px increments.
6.2 Spacing tokens
Token	Value	Typical use
space-1	4px	Icon alignment
space-2	8px	Small internal gap
space-3	12px	Eyebrow / caption gap
space-4	16px	Small card grouping
space-5	20px	Compact padding
space-6	24px	Button/card spacing
space-8	32px	Standard card padding
space-10	40px	Heading-to-content gap
space-12	48px	Section content grouping
space-16	64px	Large inset
space-20	80px	Section padding
space-24	96px	Major vertical separation
space-30	120px	Large editorial section6.3 Spacing application rules
- Use 8–12px from section marker to title.
- Use 20–28px from title to description.
- Use 24–40px between introduction and primary card grid.
- Use 20–28px for desktop module gutters.
- Use 24–32px internal card padding.
- Use 80–120px desktop section padding.
- Use 56–80px tablet section padding.
- Use 48–72px mobile section padding.
Keep groups internally compact while separating major sections clearly.

7. Layout Grid
7.1 Main container
Recommended desktop:
- Maximum content width: 1320px
- Horizontal page margins: approximately 56–80px at large desktop sizes
- Twelve-column structural grid
- Standard gutter: 24px
- Wider section spacing: 80–120px
.container {
  width: min(calc(100% - 2 * var(--page-gutter)), 1320px);
  margin-inline: auto;
}
Use Grid for main sections and repeated modules, Flexbox for individual alignment patterns.
7.2 Section layouts
Section	Columns	Composition
Hero	12	Text 6–7, artwork 5–6, intentional overlap
Services intro	12	Heading 7, description 5
Services cards	4 equal	Four portrait-oriented modules
About	12	Copy 5, photography 7
Featured work	2 equal	Image-led case studies
Process	5 equal	Five compact stages
Metrics	4 equal	Continuous colored strip
Pricing	3 equal	Three vertically aligned plans
Impact	12	Statistics 5, media 7
Testimonial/CTA	12	Quote 4, orange CTA 8
Footer	12	Brand 4, navigation groups 87.3 Alignment anchors
Use the same container left edge for:
- Logo
- Hero headline
- Section eyebrow
- Section headline
- Services grid
- Project cards
- Metrics
- Footer brand block
The screenshot's repeated left-aligned typography is essential to its editorial quality.
7.4 Grid contrast
Not every section needs the same surface arrangement.
The reference alternates between:
- Large unrestricted canvas
- Inset proof panel
- Card grid
- Full-width contrasting section
- Offset image collage
- Continuous statistic band
This variation prevents the system from becoming an uninterrupted list of identical cards.

8. Borders, Radius, and Shadows
8.1 Corner language
The reference favors rounded geometry with different radii according to scale.
Recommended system:
- Small icon shell: 8px
- Standard card: 14px
- Large showcase panel: 18px
- Major CTA panel: 20px
- Image frame: 12–16px
- Buttons: 999px / pill
- Badge or filter: 999px / pill
Use true pill geometry for buttons rather than large rectangular buttons with only slightly rounded corners.
8.2 Borders
Dark modules:
1px solid rgba(255,255,255,0.09)
Light modules:
1px solid rgba(0,0,0,0.055)
Active dark card:
1px solid rgba(255,101,15,0.48)
8.3 Shadows
Cards are primarily separated through contrasting fills and spacing, not pronounced floating shadows.
Light card recommendation:
0 8px 28px rgba(0,0,0,0.035)
Dark card recommendation:
0 8px 24px rgba(0,0,0,0.16)
Use stronger shadows sparingly on elevated modal panels, not as the default treatment.

9. Background and Surface System
9.1 Dark foundation
The hero and primary dark sections use a near-black field with subtle neutral variation.
Avoid visible patterned grids or intense blur layers.
9.2 Light editorial sections
Use a warm off-white rather than stark #FFFFFF for the primary services background.
Service cards can use nearly white surfaces with slight variations to maintain grouping.
9.3 Surface depth
Three dark levels are sufficient:
1. Page: #0B0C0D
2. Card: #1B1B1D
3. Elevated: #252527
Three light levels:
1. Section: #F7F5F2
2. Card: #FFFEFC
3. Hover: #F0ECE7
9.4 Separators
Thin horizontal lines may mark boundaries between larger dark sections.
Keep opacity low. Do not surround every block with an obvious border.

10. Header / Navigation
10.1 Structure
Observed:
- Angular orange emblem resembling an N
- White uppercase NOVACRAFT wordmark
- Centered compact navigation
- Orange CTA aligned to the right
Suggested structure:
[Logo] [Work / Services / About Us / Insights / Careers] [Let's Talk ↗]
10.2 Dimensions
Recommended:
- Header height: 80–88px
- Wordmark: approximately 18–22px
- Logo symbol: 30–38px
- Navigation text: 13–14px
- Navigation gap: 26–36px
- CTA height: 44–48px
- CTA horizontal padding: 20–26px
10.3 Behavior
Recommended, not observed:
- Sticky header on long pages
- Near-opaque charcoal background during scroll
- Active navigation shown with orange text or a small indicator
- Mobile menu opened by a clearly labeled button
Avoid heavy glassmorphism in the sticky header.

11. Hero
11.1 Composition
The hero is the most important design element.
Observed characteristics:
- Large three-line white headline
- One orange keyword
- Short supporting copy
- Primary orange button
- Secondary outlined/dark button
- Giant sculptural metallic ribbon
- Client-logo bar near the bottom
Recommended desktop geometry:
- Minimum height: approximately 700–800px including the trust strip
- Text width: 52–58%
- Visual width: 42–48%, with artwork allowed to overlap behind text boundaries
- Left text aligned to the global container
- Artwork weighted toward the right and cropped at the edge
11.2 Headline
Example structure:
We Build
Digital Products
That Drive Results.
Accent only “Drive”.
Avoid highlighting the entire last line.
11.3 Supporting paragraph
- Width: 340–430px
- Font size: 16–17px
- Line height: 1.6
- Color: muted white
- Gap from headline: 24–32px
11.4 Actions
Place primary and secondary buttons in one horizontal row on desktop.
Gap: 12–16px.
Primary CTA: orange fill.
Secondary CTA: transparent/dark pill with fine light border and optional play icon.
11.5 Hero sculpture
This is a signature graphic, not a conventional UI illustration.
See detailed art direction in Section 22.
11.6 Trust strip
Position near the lower portion of the hero.
The screenshot includes recognizable client-style wordmarks shown in muted grayscale.
Production recommendation:
- Dark rounded panel
- Small introductory label
- Six or fewer logos per desktop row
- Logos normalized by optical size
- Muted white or grayscale
- Comfortable horizontal separation
- No hover animation required for passive logos
Use licensed, authorized client marks only.

12. Section Grammar
All major editorial sections use a recurring heading pattern.
12.1 Section eyebrow
Structure:
[small orange dot] WHAT WE DO
Parameters:
- Dot approximately 6–8px
- Uppercase label
- Font size 11–12px
- Font weight 700
- Tracking 0.055em
- Gap between dot and label 7–9px
12.2 Section title
- Two or three short lines when necessary
- Heavy but less dominant than hero
- Strong left alignment
- Usually 36–52px desktop
12.3 Introductory copy
Use one short paragraph beside or beneath the title.
Do not center all section headings; the visual system strongly prefers left alignment.
12.4 Section formula
Eyebrow → Bold title → Optional supporting paragraph → Content grid → Optional action
This system should repeat without making sections identical.

13. Service Cards
13.1 Section styling
Observed as a warm ivory section containing four service cards.
Displayed categories:
- Product Strategy
- UI/UX Design
- Web Development
- Digital Marketing
13.2 Card proportions
Recommended desktop:
- Four-column grid
- Gap: 16–20px
- Card minimum height: 310–380px
- Internal padding: 24–28px
- Radius: 14–16px
Each card contains:
1. Small orange line icon
2. Heading
3. Short description
4. Bottom-aligned text link with arrow
13.3 Highlighted card
The fourth card appears with:
- Near-black fill
- Orange icon
- Orange heading
- Light supporting copy
- White or off-white link
Treat this as a curated visual variation, not a required selected state.
Rule: At most one intentionally highlighted card in a four-card service row.
13.4 Card interaction
On hover:
- Minor border-color change
- Arrow translates 3–4px
- Light card gains modest elevation
- Dark highlight becomes slightly brighter
No 3D card rotation, excessive zoom, or large bounce animations.

14. About Section and Photography Collage
14.1 Composition
Observed:
- Dark background
- Orange section label
- White heading
- Short paragraph
- Orange text link
- Two photographs arranged asymmetrically
The photographs include:
- A group collaborating around a worktable
- A modern studio or office interior
14.2 Recommended grid
Desktop:
- Text area: 42%
- Image area: 58%
- Offset images, not a uniform two-card gallery
Use one relatively small image above and one larger, wider image below.
Image corner radius: approximately 12–16px.
14.3 Photographic direction
- Authentic creative collaboration
- Natural interpersonal behavior
- Industrial-modern work environment
- Dark or neutral clothing
- Warm subdued colors
- Natural skin tones
- Controlled window or studio lighting
- Documentary/editorial feeling
Avoid theatrical corporate handshakes and sterile stock-photo smiles.

15. Featured Projects
15.1 Structure
Observed:
- Orange eyebrow label
- White section title
- Category filter pills
- Two-column image grid
- Four showcase cards
- Outlined “View All Projects” action
15.2 Grid
Recommended desktop:
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
15.3 Project imagery
Project cards are dominated by realistic product UI screenshots.
Visible categories include:
- Productivity / workflow
- Financial technology
- Travel
- Healthcare
Recommended media aspect ratio:
1.05:1 to 1.25:1
The reference uses relatively compact, nearly square image-led tiles.
15.4 Card structure
- Product visual as dominant surface
- Optional product name overlaid in a legible area
- Small category descriptor
- Consistent rounded clipping
- Optional arrow link overlay
Do not crowd the image with multiple badges or paragraphs.
15.5 Filter tabs
Shape: pill.
Selected:
- Orange fill
- Dark foreground
- Stronger visual emphasis
Unselected:
- Dark gray fill
- Light foreground
- Minimal border
Recommended minimum height: 40–44px.
15.6 Project hover behavior
- Image scale: maximum 1.025
- Duration: 220–300ms
- Card outline or arrow gains orange emphasis
- Optional black overlay changes opacity very slightly
- Project name remains readable

16. Process System
16.1 Five-step sequence
Observed sequence:
1. Discover
2. Plan
3. Design
4. Develop
5. Deliver
16.2 Component anatomy
Each step card contains:
- Small orange outline icon
- Two-digit stage number
- Short heading
- Compact explanatory copy
Recommended desktop:
- Five-column grid
- Gap: 10–16px
- Internal padding: 18–22px
- Min-height: 180–230px
- Radius: 12px
16.3 Visual behavior
All five cards should share the same visual priority.
Use numbered steps, iconography, and alignment to communicate progression.
Do not turn this into a large colorful timeline with heavy arrows.
16.4 Narrow layout
At smaller sizes, reflow into two or three columns.
Preserve numeric sequence in both DOM and visual order.

17. Metrics / Statistics
17.1 Observed strip
A bright orange bar presents four important statistics:
- 250+ Projects
- 120+ Clients
- 10+ Years
- 98% Satisfaction
Values are examples visible in the reference, not verified business claims.
17.2 Styling
- Continuous orange surface
- Rounded outer corners
- Four equal segments
- Large bold numerical values
- Smaller captions beneath
Recommended dimensions:
- Height: 130–170px desktop
- Internal padding: 28–36px
- Four-column layout
- Main number: 34–48px
17.3 Contrast
Use dark text on bright orange for small or normal-size labels when necessary to meet accessibility requirements.
White may be used on sufficiently large display numerals only after checking contrast.
17.4 Spacing
Do not place thick dividers between metrics unless necessary.
The continuous orange surface is the primary grouping device.

18. Impact / Case-Study Module
18.1 Visual composition
Observed large charcoal rounded panel containing:
- Small orange heading
- White case-study headline
- Vertically stacked numbers
- Orange CTA
- Team photograph
- Two small project/application previews
18.2 Recommended geometry
- Full container width
- Radius: 18–20px
- Padding: 32–44px
- Text/stat area: 42%
- Media collage: 58%
- Desktop minimum height: 480–560px
18.3 Statistics
Statistics are separated vertically.
Each metric includes:
- Small line icon
- Bold numeric value
- One-line descriptor
Use restrained orange outlines instead of filled orange icon tiles.
18.4 Media collage
Top: wide collaborative photograph.
Bottom: two contrasting project tiles, one potentially orange and one neutral/dark.
Avoid arbitrary image rotation. The reference favors rectangular alignment and modest corner rounding.

19. Testimonials
19.1 Section anatomy
Observed:
- Eyebrow label
- Heading
- Large quote-mark icon
- Short client quote
- Small portrait/avatar
- Client name and role
- Compact navigation arrows or slide indicators
19.2 Layout
The testimonial section is editorial rather than card-heavy.
Recommended desktop:
- Heading max-width: 400px
- Testimonial quote max-width: 500px
- Body: 16–18px
- Quote mark: 44–60px
- Avatar: 36–44px diameter
19.3 Carousel behavior
If interactive:
- Use accessible previous/next controls
- Expose slide position to assistive technologies
- Avoid automatic slide rotation
- Preserve stable height
- Keep motion horizontal and restrained

20. CTA Sections and Footer
20.1 Large orange CTA
Observed beside the testimonial area.
Contains:
- Saturated orange background
- White large heading
- Brief supporting sentence
- Dark pill button
- Sculptural orange-toned decorative imagery
Recommended geometry:
- Radius: 18–20px
- Padding: 40–56px
- Heading: 36–48px
- Text occupies 50–65%
- Decorative art extends to the right/background
The artwork should be subordinate to the message.
20.2 Final dark CTA
Observed near the footer:
- Dark background
- Small orange label
- Bold white contact headline
- Orange button
- Small team photograph
Use a compact asymmetrical split layout.
20.3 Footer
Observed visual pattern:
- Dark surface
- Brand logo and wordmark
- Small company blurb
- Social icons
- Multiple link groups
- Fine-print copyright information
Recommended desktop:
- Brand column: 35–40%
- Navigation groups: remaining width
- Links 13–14px
- Group headings 12–13px and medium-to-bold weight
- Muted link color
- Hover color white or orange
Keep footer dense and well organized.

21. Buttons and Links
21.1 Primary button
- Orange fill
- Dark foreground for accessible small text
- Fully rounded
- 44–52px height
- Horizontal padding 20–28px
- Semi-bold typography
- Optional arrow to the right
21.2 Secondary button
- Transparent or near-black background
- Light text
- Subtle border
- Pill shape
- Optional play icon
21.3 Dark-on-orange button
Use for large orange CTA panels.
- Dark graphite fill
- White text
- Fully rounded
- White/dark arrow depending on contrast
21.4 Text links
Use simple text with a small arrow.
Common component:
Learn More  ↗
Arrow offset: 6–10px.
21.5 Hover
- Duration: 160–220ms
- Arrow movement: 3–4px
- Background color shift: restrained
- No elastic easing
- No large-scale movement

22. Imagery and Art Direction
22.1 Hero sculpture
Subject: Continuous looped ribbon or intertwined toroidal bands.
Shape: Three-dimensional, flowing, metallic, spiraling.
Material: Brushed copper, bronze, polished black metal, selective orange reflections.
Composition: Large object, cropped by the hero's right and lower edges.
Camera: Three-quarter perspective, strong sense of depth.
Lighting: Focused warm key light, dark environmental fill, bright orange rim highlights.
Background: Black or near-black.
Post-processing: High contrast, restrained glow, polished highlights.
UI integration: The sculpture sits behind or alongside the hero heading without obscuring critical text.
Avoid: Abstract blue-purple clouds, glass orbs, generic gradient blobs, cartoon ribbons.
22.2 Team photography
Subject: Small groups of designers, strategists, and developers collaborating.
Framing: Environmental mid-shot or candid overhead view.
Lighting: Natural light mixed with practical interior light.
Palette: Warm neutrals, brown, charcoal, muted blue, realistic skin tones.
Texture: Editorial grain is acceptable, but not heavy distortion.
Integration: Rounded rectangular crops aligned to the grid.
22.3 Product mockups
Subject: Realistic web and mobile applications.
Presentation: Detailed screenshots, mobile devices, responsive UI tiles.
Framing: Product fills most of the card.
Colors: Projects may contain their own distinct identity colors; surrounding site UI must remain coherent.
Detail: Interfaces should look plausible, not like abstract dashboard textures.
Integration: Prefer real HTML/CSS screenshots or accurate image assets over arbitrary AI-generated gibberish.
22.4 Imagery rules
- Treat hero artwork as a single high-impact visual.
- Keep people recognizable and human.
- Prefer crisp application UI over faux-device clutter.
- Preserve deliberate cropping on all breakpoints.
- Use gradients only where they support material depth.
- Do not apply a global orange tint to every photograph.

23. Signature Motifs
Motif A — Orange brand marker
A small circle preceding uppercase section labels.
Use consistently.
Motif B — Metallic orange loop
The primary differentiating art asset.
May reappear in cropped, subdued form inside major contact CTAs.
Motif C — Black versus ivory section rhythm
A high-priority signature of the overall page.
Do not remove the light services area.
Motif D — One spotlight card
One card in a repeating set may receive an inverted or orange treatment.
Examples:
- Digital Marketing service
- Featured Growth plan
- Selected work filter
Motif E — Compact pill actions
Small, rounded CTA buttons with arrows.
Motif F — Human/product juxtaposition
Team photography paired with software product screenshots in the same module.
Motif G — Continuous orange metric bar
A wide horizontal signal surface, not four floating orange cards.

24. Motion System
Status: Inferred / Recommended. A static screenshot does not establish actual animation.
24.1 Timing
- Fast state feedback: 140ms
- Button/link transition: 180ms
- Card hover: 240ms
- Content reveal: 450–550ms
Easing:
cubic-bezier(0.22, 1, 0.36, 1)
24.2 Recommended interactions
Navigation: Smooth color transition.
Button: Small arrow translation and subtle fill shift.
Service card: Slight background/border change.
Project card: Minimal image enlargement, capped at 2.5%.
Section entrance: Optional opacity plus 12–20px upward translation.
Hero sculpture: Static by default. If animation is added, use extremely subtle rotation or lighting changes over 12–20 seconds.
24.3 Avoid
- Bouncy elastic movement
- Fast continuous spinning
- Scroll-jacking
- Constant parallax across all sections
- Excessive staggered reveal sequences
- Cursor trails
- Motion that compromises text legibility
24.4 Reduced motion
All nonessential animations must stop or become effectively instantaneous under prefers-reduced-motion: reduce.

25. Responsive Behavior
All mobile/tablet specifications below are inferred, because the supplied composite does not establish breakpoint-specific screenshots.
25.1 Large desktop — 1440px and above
- Full navigation visible
- Hero uses split text/art arrangement
- Four service cards
- Two-column project gallery
- Five process cards
- Four metrics horizontally
- Three pricing cards
- Multi-column footer
25.2 Laptop — 1024–1439px
- Page gutters tighten to 40–56px
- Hero title scales responsively
- Sculptural art retains dominant presence
- Service cards may remain four columns while card widths are adequate
- Process reflows into three plus two columns when necessary
- Pricing can remain three columns above minimum card width
25.3 Tablet — 768–1023px
- Hero split becomes approximately 55/45 or stacks when constrained
- Navigation collapses if content no longer fits
- Services become two columns
- Projects remain two columns where readable
- Process becomes two or three columns
- Pricing becomes single column when plan cards would be too narrow
- Impact media may stack below headline/statistics
25.4 Mobile — below 768px
Recommended order:
Header: Logo left, menu button right.
Hero: Headline → description → CTA actions → metallic artwork → trust logos.
Services: One column, or two only where width comfortably permits.
About: Text followed by asymmetrical imagery.
Projects: Single-column cards.
Process: One or two columns in numeric order.
Metrics: Two-column grid inside one continuous orange surface.
Pricing: Single-column tiers.
Impact: Text and stats, then photographic collage.
Testimonial / contact CTA: Stacked sections.
Footer: Brand block followed by two-column link groups, stacking further if necessary.
25.5 Mobile art-direction preservation
Do not remove the sculptural hero artwork.
Instead:
- Re-crop the ribbon composition.
- Reduce scale while retaining depth.
- Keep the orange highlight visible.
- Use a dark background.
- Avoid placing text on top of the brightest artwork.
- Retain rounded photography and modular product cards.
25.6 Mobile sizing
Recommended:
- Horizontal padding: 20–24px
- Section padding: 56–72px
- Card padding: 20–24px
- Minimum button target: 44px
- Hero artwork aspect ratio: approximately 1.1–1.4, adjusted by the asset composition

26. Accessibility
26.1 Color contrast
Target:
- WCAG AA 4.5:1 for ordinary text
- 3:1 for large text and relevant UI boundaries
- Visible controls in both dark and light themes
Test actual rendered pairs.
Use dark text on bright orange whenever small white text would fail contrast requirements.
26.2 Keyboard focus
Focus ring:
- 2px solid bright orange on dark backgrounds
- 2px solid deep orange on ivory
- 3px outline offset
Focus indication must remain visible independently of hover.
26.3 Touch targets
Aim for 44×44px interactive areas, especially for:
- Mobile navigation
- Filter pills
- Pricing buttons
- Carousel arrows
- Card links
26.4 Semantic structure
- One page-level H1
- Logical H2/H3 hierarchy
- Semantic navigation
- Buttons for actions
- Links for destinations
- Lists for repeated navigation/project groups when appropriate
26.5 Images
- Decorative ribbon artwork: empty alt text when the surrounding text conveys the message
- Meaningful team photographs: concise descriptive alt
- Product screenshots: describe the product UI or project purpose
- Logo collections: provide accessible names for each valid logo
Do not use verbose alt descriptions for purely decorative effects.
26.6 Forms
Use explicit labels, meaningful errors, aria-describedby where useful, and proper success feedback.
26.7 Motion
Honor reduced-motion settings and never autoplay testimonial slides.

27. CSS Tokens — Production Foundation
The following tokens are recommended normalized implementation values, not recovered proprietary design tokens.
:root {
  /* COLORS: DARK */
  --color-black: #0b0c0d;
  --color-dark: #111214;
  --color-dark-card: #1b1b1d;
  --color-dark-raised: #252527;

  /* COLORS: LIGHT */
  --color-ivory: #f7f5f2;
  --color-white: #fffefc;
  --color-light-hover: #f0ece7;

  /* COLORS: ORANGE */
  --color-orange: #ff650f;
  --color-orange-bright: #ff781b;
  --color-orange-deep: #b83c00;
  --color-copper: #a95024;

  /* TEXT */
  --text-on-dark: #f8f7f5;
  --text-muted-dark: #b4b1ae;
  --text-on-light: #19191a;
  --text-muted-light: #65615e;

  /* BORDERS */
  --border-dark: rgba(255, 255, 255, 0.09);
  --border-dark-hover: rgba(255, 101, 15, 0.48);
  --border-light: rgba(0, 0, 0, 0.055);

  /* TYPOGRAPHY */
  --font-display: "Manrope", "Plus Jakarta Sans",
    "Inter Tight", sans-serif;
  --font-body: "Manrope", "Plus Jakarta Sans",
    sans-serif;

  --font-hero: clamp(3.25rem, 5.8vw, 6rem);
  --font-h1: clamp(2.5rem, 4.3vw, 4.5rem);
  --font-h2: clamp(2.125rem, 3.3vw, 3.75rem);
  --font-h3: clamp(1.5rem, 2.2vw, 2rem);
  --font-body-base: 1rem;
  --font-label: 0.75rem;

  /* SPACING */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-30: 120px;

  /* LAYOUT */
  --container-max: 1320px;
  --page-gutter: clamp(20px, 4.5vw, 76px);
  --grid-gap: 24px;
  --section-space: clamp(64px, 7vw, 120px);

  /* CORNERS */
  --radius-icon: 8px;
  --radius-small: 10px;
  --radius-card: 14px;
  --radius-media: 16px;
  --radius-panel: 20px;
  --radius-pill: 999px;

  /* SHADOWS */
  --shadow-light: 0 8px 28px rgba(0,0,0,0.035);
  --shadow-dark: 0 8px 24px rgba(0,0,0,0.16);

  /* MOTION */
  --motion-fast: 140ms;
  --motion-base: 180ms;
  --motion-card: 240ms;
  --motion-reveal: 500ms;
  --ease-out: cubic-bezier(0.22,1,0.36,1);

  /* Z-INDEX */
  --z-base: 0;
  --z-decoration: 1;
  --z-content: 2;
  --z-header: 30;
  --z-overlay: 50;
  --z-modal: 100;
}
27.1 Core page styles
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-black);
  color: var(--text-on-dark);
  font-family: var(--font-body);
  font-size: var(--font-body-base);
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea,
select {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  width: min(
    calc(100% - (2 * var(--page-gutter))),
    var(--container-max)
  );
  margin-inline: auto;
}

.section {
  padding-block: var(--section-space);
}

.theme-dark {
  background: var(--color-dark);
  color: var(--text-on-dark);
  color-scheme: dark;
}

.theme-light {
  background: var(--color-ivory);
  color: var(--text-on-light);
  color-scheme: light;
}

:focus-visible {
  outline: 2px solid var(--color-orange);
  outline-offset: 3px;
}

.theme-light :focus-visible {
  outline-color: var(--color-orange-deep);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
27.2 Section eyebrow
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.eyebrow::before {
  content: "";
  display: block;
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: var(--color-orange);
}

.theme-light .eyebrow {
  color: var(--color-orange-deep);
}
27.3 Buttons
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 24px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  transition:
    background-color var(--motion-base) ease,
    color var(--motion-base) ease,
    border-color var(--motion-base) ease;
}

.btn-primary {
  background: var(--color-orange);
  color: var(--color-black);
}

.btn-primary:hover {
  background: var(--color-orange-bright);
}

.btn-secondary {
  background: transparent;
  color: var(--text-on-dark);
  border-color: rgba(255,255,255,0.25);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.08);
}

.btn-dark {
  background: var(--color-dark);
  color: var(--text-on-dark);
}

.btn-dark:hover {
  background: var(--color-dark-raised);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
27.4 Major grids
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr)
                         minmax(0, 0.9fr);
  align-items: center;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: var(--color-orange);
  border-radius: var(--radius-card);
  padding: 32px;
  gap: 24px;
}
27.5 Responsive layout
@media (max-width: 1199px) {
  .process-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .hero-grid,
  .projects-grid,
  .services-grid,
  .process-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-title {
    font-size: clamp(2.75rem, 10.5vw, 3.625rem);
  }
}

@media (max-width: 359px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
Use these rules as the starting implementation and refine during responsive QA.

28. Component Architecture
Recommended React/Next.js structure:
src/
  app/
    page.tsx
    layout.tsx

  components/
    layout/
      SiteHeader.tsx
      MobileNavigation.tsx
      SiteFooter.tsx
      SectionContainer.tsx
      SectionHeading.tsx

    ui/
      Button.tsx
      Eyebrow.tsx
      ArrowLink.tsx
      Icon.tsx
      Metric.tsx
      PillTabs.tsx
      MediaFrame.tsx

    sections/
      HeroSection.tsx
      TrustedBrands.tsx
      ServicesSection.tsx
      AboutSection.tsx
      FeaturedProjects.tsx
      ProcessSection.tsx
      MetricsSection.tsx
      PricingSection.tsx
      ImpactSection.tsx
      TestimonialsSection.tsx
      ContactCTA.tsx

    cards/
      ServiceCard.tsx
      ProjectCard.tsx
      ProcessCard.tsx
      PricingCard.tsx

  styles/
    tokens.css
    globals.css
    components.css

  data/
    services.ts
    projects.ts
    process.ts
    pricing.ts
    navigation.ts

  public/
    images/
      hero-sculpture.avif
      team-collaboration.webp
      studio-interior.webp
      project-taskflow.webp
      project-fintech.webp
      project-travel.webp
      project-healthcare.webp
28.1 Component API guidance
Button
Properties:
- variant: primary / secondary / dark / text
- size: sm / md / lg
- icon
- iconPosition
- disabled
- loading
ServiceCard
Properties:
- icon
- title
- description
- href
- emphasized
ProjectCard
Properties:
- image
- title
- category
- href
- accessibleImageDescription
PricingCard
Properties:
- tier
- price
- billingPeriod
- description
- features
- featured
- ctaLabel
SectionHeading
Properties:
- eyebrow
- title
- description
- theme
- alignment
28.2 Rendering strategy
Prefer static/server rendering for content sections where feasible.
Use client-side interactivity only for:
- Mobile menu
- Project filters
- Carousel
- Pricing period selection, if implemented
- Interactive forms
28.3 Asset strategy
- Real raster or rendered 3D art for hero sculpture
- AVIF/WebP for photographs
- SVG for icons and brand symbol
- CSS for cards, fills, buttons, and gradients
- Actual UI screenshots for featured projects
Do not render the entire website as one giant image.

29. Tailwind Mapping
If using Tailwind, map the system into semantic theme values.
Suggested theme configuration:
export default {
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0B0C0D",
          900: "#111214",
          800: "#1B1B1D",
          700: "#252527"
        },
        paper: {
          DEFAULT: "#F7F5F2",
          white: "#FFFEFC"
        },
        orange: {
          DEFAULT: "#FF650F",
          bright: "#FF781B",
          deep: "#B83C00"
        }
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      borderRadius: {
        card: "14px",
        panel: "20px",
        pill: "999px"
      },
      maxWidth: {
        site: "1320px"
      }
    }
  }
}
For Tailwind v4, expose equivalent named tokens through the project's theme CSS.
Recommended patterns:
- bg-graphite-950
- text-paper-white
- bg-orange
- rounded-card
- rounded-pill
- grid grid-cols-12
- tracking-tight
- max-w-site
Do not use Tailwind's default gray palette without mapping it to the warm-charcoal neutrals.

30. Content / Pattern Inventory
Navigation
- Brand
- Work
- Services
- About Us
- Insights
- Careers
- Let's Talk
Hero
- Strong agency positioning headline
- Short service explanation
- Explore work CTA
- Showreel CTA
- Metallic sculpture
- Trusted client logos
Services
- Product Strategy
- UI/UX Design
- Web Development
- Digital Marketing
About
- Agency positioning
- Short biography
- Photography collage
- Learn More action
Projects
- Filter controls
- Four image-led portfolio cards
- View All Projects CTA
Process
- Discover
- Plan
- Design
- Develop
- Deliver
Metrics
- Project count
- Client count
- Experience
- Satisfaction
Pricing
- Starter
- Growth
- Pro
Reference-visible example prices:
- Starter: $49
- Growth: $99
- Pro: $199
These values are illustrative screenshot content, not validated commercial pricing.
Trust / Impact
- Client logos
- Agency numbers
- Photography
- Mini-project previews
- Testimonials
Conversion
- Large orange contact panel
- Dark final contact section
- Compact footer navigation

31. Component States
31.1 Button
Default: Solid orange or outline variant.
Hover: Slight color shift and arrow movement.
Focus: Accessible outline with offset.
Pressed: Slightly darker fill; no aggressive scaling.
Disabled: Reduced opacity with preserved legibility.
Loading: Inline progress indicator; stable button width.
31.2 Service card
Default: Neutral surface.
Hover: Border and surface adjustment.
Focus within: Visible card outline.
Featured: Dark inverted treatment.
31.3 Project filter
Default: Neutral pill.
Hover: Slightly brighter neutral.
Selected: Orange fill.
Keyboard focus: High-contrast outline.
Loading: Preserve gallery footprint during filtering.
Empty results: Clear message with reset action.
31.4 Project card
Default: Clean product screenshot.
Hover: Small image scale and visible arrow.
Focus: Clear card focus outline.
Loading: Aspect-ratio-preserving placeholder.
Image unavailable: Neutral branded fallback with title text.
31.5 Pricing card
Default: Dark neutral surface.
Featured: Orange fill, visually elevated in hierarchy.
Hover: Minor border/surface change.
Selected: Distinct state only if choosing a plan affects actual form state.
Unavailable: Explanatory message and disabled action.
31.6 Form field
Default: Neutral outlined input.
Hover: Slight border emphasis.
Focus: Accessible orange/deep-orange focus ring.
Error: Clear error text plus appropriately contrasting border or icon.
Success: Confirmed message, not just a color change.
Disabled: Reduced emphasis and noninteractive state.

32. Visual Density Rules
32.1 Primary density
Use broad, dramatic elements:
- Hero text
- Metallic sculpture
- Major section titles
- Orange CTA
- Large photography
32.2 Secondary density
Use compact structured components:
- Service cards
- Projects
- Process cards
- Pricing
- Statistics
32.3 Tertiary density
Use small supporting information:
- Eyebrows
- Captions
- Category chips
- Navigation
- Client logo labels
- Footer details
32.4 Density hierarchy
Do not allow every section to contain the same number of similarly sized cards.
Preferred sequence:
Open hero → inset logo strip → structured service grid → large collage → structured portfolio → compact process → bold metrics → pricing grid → focused CTA.
This cadence is fundamental to the reference.

33. DO / DON'T
DO
- Use near-black charcoal foundations.
- Use warm off-white sections.
- Use saturated orange sparingly but confidently.
- Make hero typography large and tightly tracked.
- Include a three-dimensional metallic hero sculpture.
- Use expressive intentional line breaks.
- Use real collaboration photography.
- Showcase believable digital product screenshots.
- Use rounded rectangular cards.
- Use orange pill CTAs.
- Keep headings left aligned.
- Preserve the one-featured-card pattern.
- Give the metrics strip a continuous orange surface.
- Keep footer content compact and useful.
- Build responsive sections as actual components.
DON'T
- Use purple/blue aurora gradients.
- Use generic floating glass cards.
- Substitute the hero sculpture with a simple gradient circle.
- Make every section a dark card grid.
- Remove the ivory services area.
- Use oversized shadows everywhere.
- Use generic stock tech illustrations.
- Make all cards orange.
- Center all section headings.
- Use thin, wide-tracked headlines in place of bold grotesk type.
- Use heavy neon glow.
- Add decorative noise across the entire site.
- Hide important portfolio imagery on mobile.
- Animate every component independently.
- Reproduce the screenshot montage as a permanent sidebar layout.

34. Visual QA Checklist
Macro composition
- Hero is visually dominant.
- Sculpture fills the right portion of the hero.
- Hero headline remains legible over the composition.
- Light services section creates a clear contrast break.
- Section sequencing feels editorial rather than repetitive.
- Large orange CTA is visually prominent.
- Footer integrates with the dark sections.
Palette
- Dark backgrounds closely follow the graphite palette.
- Orange is the only site-wide saturated accent.
- Ivory sections retain a warm neutral cast.
- Color distribution remains close to the target rhythm.
- Orange text contrast is tested rather than assumed.
Typography
- Font morphology resembles a compact geometric grotesk.
- Hero weight is approximately 750–800.
- Headline tracking is appropriately tight.
- Major line breaks are intentional.
- Body copy is visually secondary but readable.
- Eyebrows follow one consistent treatment.
Components
- Button pills have consistent height and padding.
- Service cards share geometry.
- One service card is intentionally highlighted.
- Project cards use realistic UI imagery.
- Process contains five clear stages.
- Metrics read as one continuous bar.
- Growth pricing is the featured center plan.
- Focus and disabled states are implemented.
Imagery
- Hero artwork has visible metallic materiality.
- Orange highlights are integrated into the sculpture.
- Team photography feels authentic.
- Product screenshots contain plausible UI details.
- Crop behavior is controlled on mobile.
- Images have reserved dimensions to prevent layout shifts.
Responsive QA
Test at:
- 1440px desktop
- 1280px laptop
- 1024px small laptop
- 768px tablet
- 390px mobile
- 320px narrow mobile
At each size verify:
- No unwanted horizontal overflow.
- Navigation remains usable.
- Hero headline doesn't collide with sculpture.
- Cards maintain legible text.
- Pricing displays clearly.
- Project filters remain operable.
- Metrics preserve hierarchy.
- Mobile artwork still retains the original design language.
Accessibility / Engineering QA
- Sufficient text contrast.
- Visible keyboard focus.
- Semantic landmarks and heading order.
- Proper alt text strategy.
- Working reduced-motion support.
- Form error and success states.
- Appropriate image optimization.
- No large layout shifts.
- Lazy-load below-fold media.
- Avoid unnecessary client-side JavaScript.

35. AI Front-end Agent Prompt
Use the following as a handoff to a coding agent:
Build a premium creative digital-agency website using the NOVACRAFT Orange Graphite design system.
The visual identity is defined by near-black #0B0C0D, charcoal cards #1B1B1D, warm ivory #F7F5F2, off-white typography, and a single saturated orange accent #FF650F.
Use bold Manrope-like geometric sans typography, tight heading tracking, large editorial headlines, tiny uppercase section labels with orange dots, pill-shaped CTA buttons, and rounded rectangular modules.
The hero must feature a large three-line white headline with one orange highlighted keyword and a dramatic black-and-copper metallic 3D ribbon sculpture filling the right side. Include a dark rounded client-logo strip below the main hero composition.
Build coherent reusable sections for services, about photography, projects, five-step process, orange metrics, three-tier pricing, agency impact, testimonials, contact CTA, and footer.
The services section must use a warm ivory background with four cards, one inverted near-black highlighted card. Project cards must contain believable digital-product UI images in a two-column layout. Use a continuous orange metrics strip and an orange featured pricing plan.
Preserve hierarchy, art direction, and content density across responsive layouts. Prefer CSS Grid for major geometry and Flexbox for local alignment. Use semantic components and centralized design tokens.
Add restrained hover transitions, accessible focus states, reduced-motion support, realistic image cropping, and optimized assets.
Do not introduce purple/blue gradients, glassmorphism, generic startup illustrations, excessive shadows, random accent colors, centered-everything composition, or repetitive generic SaaS layouts.
Fidelity priority: Macro composition → palette → typography → hero art → section contrast → grid → spacing → card geometry → imagery → density → interactions.

36. AI Image Art-Direction Prompts
36.1 Hero sculpture — Positive prompt
Create a premium abstract 3D sculpture for the hero section of a high-end digital product design agency website.
A large continuous metallic ribbon twists into multiple interlocking circular loops, combining satin black metal, brushed copper, and polished vivid orange edges.
The sculpture should have a dramatic three-quarter perspective, deep internal shadows, clean flowing surfaces, refined studio reflections, precise industrial materiality, and warm orange rim lighting.
Place the object against a nearly black studio background. Compose it toward the right side with negative space on the left for typography. Let the lower ribbon extend diagonally beyond the frame.
High-end contemporary CGI, luxury product advertising, strong contrast, sophisticated art direction, clean geometry, realistic reflections, cinematic material shading, 16:9 wide composition.
36.2 Hero sculpture — Negative prompt
Avoid blue, purple, teal, rainbow neon, glass spheres, soft cloudy gradients, chrome rainbow materials, cartoon shapes, cyberpunk city imagery, excessive smoke, overexposed bloom, text, logos, UI controls, interface screenshots, visible watermarks, low-detail geometry, and cheap plastic surfaces.
36.3 Team photography — Positive prompt
Editorial documentary photograph of a small multidisciplinary creative team collaborating on a digital product in a contemporary design studio.
Natural candid interaction, notebooks and laptops, realistic office materials, warm directional daylight, subdued charcoal and earth-tone clothing, genuine expressions, modern industrial interior, cinematic but authentic composition, balanced exposure, high-quality photography, natural skin tones, understated premium agency branding.
36.4 Team photography — Negative prompt
Avoid staged handshake poses, excessive smiles at camera, fake-looking laptop interfaces, unnatural hands, hyper-saturated business stock photography, plastic skin, artificial corporate blue lighting, and unnecessary branding.
36.5 Portfolio imagery — Positive prompt
High-fidelity digital product presentation of a contemporary mobile and web application, professionally designed UI, believable data, clear hierarchy, refined typography, accurate spacing, realistic mobile-device framing where appropriate, cohesive component system, neutral studio background, art-directed product showcase, crisp presentation suitable for a premium design agency portfolio card.
36.6 Portfolio imagery — Negative prompt
Avoid illegible generated interface text, arbitrary fake charts, overcrowded dashboards, inconsistent UI components, exaggerated neon treatments, warped phone geometry, overlapping fake controls, and decorative interface elements that do not serve a clear function.
Implementation note: For portfolio cards, genuine interface screenshots or developer-rendered mockups should be preferred over AI-generated UI images when accurate text and controls matter.

37. Confidence and Assumptions
High confidence — Observed
- Dark graphite is the dominant surface family.
- Orange is the principal accent.
- A warm ivory services section interrupts the dark sections.
- Hero uses bold sans-serif typography and a metallic orange 3D element.
- Cards and buttons have rounded geometry.
- Service grid contains four cards.
- Project gallery is image-led.
- Process contains five stages.
- Pricing contains three tiers with one emphasized plan.
- Photography is integrated with service and credibility content.
- Section labels use small orange markers.
Medium confidence — Estimated
- Overall grid and maximum width
- Original headline dimensions
- Desktop section padding
- Card corner radii
- Button geometry
- Exact grayscale and orange HEX values
- Typeface morphology and closest substitutes
- Image aspect ratios
Lower confidence — Inferred
- Mobile layout
- Sticky navigation
- Animation system
- Carousel mechanics
- Pricing selection behavior
- Image cropping rules outside the visible reference
- Exact order of every section in a single deployed page
Recommended production decisions
- Manrope as the starting font candidate
- 1320px maximum container
- 12-column desktop grid
- 4px foundational spacing scale
- 14px standard card radius
- 999px pill buttons
- 180–240ms hover transitions
- Accessible dark foreground on bright orange controls
- Semantic component-based implementation
Fidelity interpretation
The goal is not to copy every tiny visual artifact from a compressed screenshot. It is to reproduce the underlying system accurately enough that new interfaces appear to belong to the same design family.

38. Final Design Formula
For any new NOVACRAFT-inspired page or section, use:
SECTION =
- One clear editorial headline
- Optional orange-dot eyebrow
- A defined content grid
- One primary content or visual focal point
- Near-black or ivory foundation
- Restrained orange emphasis
- Consistent rounded geometry
- Compact, legible supporting information
- One purposeful action where needed
PAGE =
- Dramatic hero
- Credibility proof
- Contrasting editorial section
- Modular service/product content
- Human or application imagery
- Numeric evidence
- Strong orange conversion moment
- Structured dark footer
One-line DNA:
Black editorial canvas + warm ivory contrast + electric orange accents + bold geometric grotesk typography + sculptural metallic CGI + authentic studio photography + precision-organized product cards + rounded premium UI.
This is the system to preserve when designing new landing pages, case studies, service pages, portfolio experiences, and agency interfaces.