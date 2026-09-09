/**
 * game.js - "გადაარჩინე ჭიამაია" (Save the Ladybug)
 * Core Game Engine, Canvas Vector Graphics, Physics, Level Progression
 */

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Virtual Resolution
const V_WIDTH = 800;
const V_HEIGHT = 700;
canvas.width = V_WIDTH;
canvas.height = V_HEIGHT;

// Responsive Scaling
function resizeCanvas() {
    const container = document.getElementById('canvas-wrapper');
    const maxWidth = Math.min(window.innerWidth * 0.95, 840);
    const maxHeight = Math.min(window.innerHeight * 0.88, 740);

    const scale = Math.min(maxWidth / V_WIDTH, maxHeight / V_HEIGHT);
    canvas.style.width = `${V_WIDTH * scale}px`;
    canvas.style.height = `${V_HEIGHT * scale}px`;
    // The HTML HUD uses the same virtual coordinate system as the Canvas.
    // This keeps its size and spacing locked to the game at every viewport size.
    container.style.setProperty('--game-scale', scale.toFixed(4));
    container.style.setProperty('--hud-offset', `${(8 * scale).toFixed(2)}px`);
    container.style.setProperty('--hud-top', `${(10 * scale).toFixed(2)}px`);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game State Constants
const STATE = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    WIN_ANIMATION: 'WIN_ANIMATION',
    LOSE_ANIMATION: 'LOSE_ANIMATION',
    CEILING_CATCH: 'CEILING_CATCH',
    LEVEL_WON: 'LEVEL_WON',
    GAME_OVER: 'GAME_OVER',
    EPILOGUE: 'EPILOGUE'
};

// Color Palettes
const LADYBUG_PALETTES = {
    red: { light: '#ff6666', base: '#e60000', dark: '#990000', nameKa: 'კლასიკური წითელი', nameEn: 'Classic Red' },
    yellow: { light: '#ffe66d', base: '#f4a261', dark: '#b86b24', nameKa: 'მზიანი ყვითელი', nameEn: 'Sunny Yellow' },
    green: { light: '#52b788', base: '#2a9d8f', dark: '#1b4332', nameKa: 'ზურმუხტისფერი', nameEn: 'Emerald Green' },
    pink: { light: '#ff85a2', base: '#e01e5a', dark: '#800f2f', nameKa: 'ვარდისფერი', nameEn: 'Vibrant Pink' },
    blue: { light: '#60a5fa', base: '#2563eb', dark: '#1e3a8a', nameKa: 'ზღვისფერი ლურჯი', nameEn: 'Ocean Blue' },
    purple: { light: '#c084fc', base: '#9333ea', dark: '#581c87', nameKa: 'იასამნისფერი', nameEn: 'Royal Violet' }
};

const SPIDER_PALETTES = {
    classic: {
        leg: 'rgba(160, 150, 135, 0.85)',
        detail: '#6b5e51',
        head: '#8a7d6d',
        body: '#a39786',
        eye: '#e63946',
        nameKa: 'კლასიკური სარდაფის',
        nameEn: 'Classic Cellar'
    },
    black: {
        leg: 'rgba(45, 45, 55, 0.92)',
        detail: '#111115',
        head: '#1c1917',
        body: '#27272a',
        eye: '#ff0055',
        nameKa: 'შავი ჩრდილი',
        nameEn: 'Shadow Black'
    },
    white: {
        leg: 'rgba(215, 225, 235, 0.9)',
        detail: '#94a3b8',
        head: '#cbd5e1',
        body: '#e2e8f0',
        eye: '#06d6a0',
        nameKa: 'მოჩვენებითი თეთრი',
        nameEn: 'Ghost White'
    },
    purple: {
        leg: 'rgba(168, 85, 247, 0.85)',
        detail: '#3b0764',
        head: '#581c87',
        body: '#7e22ce',
        eye: '#eab308',
        nameKa: 'შხამიანი იისფერი',
        nameEn: 'Toxic Purple'
    },
    brown: {
        leg: 'rgba(146, 100, 65, 0.9)',
        detail: '#432818',
        head: '#5c3d28',
        body: '#785135',
        eye: '#f97316',
        nameKa: 'ხის ყავისფერი',
        nameEn: 'Woodland Brown'
    }
};

// Multilingual Translations
const TRANSLATIONS = {
    ka: {
        gameTitle: "გადაარჩინე ჭიამაია",
        subtitle: "შეუშალე ხელი ჭიამაიას ობობას ქსელთან მიახლოებაში და დაეხმარე თავისუფლებისკენ გაფრენაში!",
        startGame: "დაიწყე თამაში",
        selectLevel: "ტურის არჩევა",
        viewEpilogue: "ნახე ეპილოგი",
        settings: "პარამეტრები",
        howToPlay: "როგორ ვითამაშოთ",
        levelSelectTitle: "აირჩიე ტური",
        levelSelectSub: "გაიარე ტურები თანმიმდევრობით",
        close: "დახურვა",
        rulesTitle: "თამაშის წესები",
        rulesUnderstood: "გასაგებია, დავიწყოთ!",
        levelWonTitle: "ტური წარმატებით გაიარე!",
        nextLevel: "შემდეგ დონეზე გადასვლა ➔",
        viewEpilogueBtn: "ეპილოგის ნახვა ✨",
        gameOverTitle: "ობობამ დაიჭირა...",
        tryAgain: "🔄 თავიდან ცდა",
        spiderThreat: "ობობის საფრთხე:",
        soundButton: "ხმა",
        settingsButton: "პარამეტრები",
        restartButton: "ტურის განახლება",
        homeButton: "მთავარი მენიუ",
        locked: "დაბლოკილია",
        threatLevelTitle: "საფრთხის დონე",
        barriers: "ბარიერები",
        level: "ტური",
        keyboardHint: "მაუსით ან თითით დადე ფოთოლი.",
        dismissHint: "დახურვა",
        musicSettingLabel: "🎵 მუსიკა",
        soundSettingLabel: "🔊 ხმა",
        audioEnabled: "ჩართულია",
        audioDisabled: "გამორთულია",
        musicOn: "🎵 მუსიკა: ჩართულია",
        musicOff: "🎵 მუსიკა: გამორთულია",
        skipToMenu: "გამოტოვება (მენიუ) ➔",
        freedomSign: "🌿 თავისუფლება",
        woohoo: "ვუჰუუ! 🎉",
        scream: "ააა! 😭",
        settingsTitle: "⚙️ პარამეტრები",
        ladybugColorLabel: "🐞 ჭიამაიას ფერი",
        spiderColorLabel: "🕷️ ობობის ფერი",
        languageLabel: "🌐 თამაშის ენა / Game Language",
        saveAndClose: "შენახვა და დახურვა",
        outOfBarriers: "ბარიერების ლიმიტი ამოიწურა! შეეხე უშუალოდ ჭიამაიას მის შესაბრუნებლად.",
        winMsgDefault: "შესანიშნავია! ჭიამაია გადარჩა და ბედნიერი გაფრინდა ფანჯრიდან. მოემზადე შემდეგი ტურისთვის!",
        winMsgFinal: "გილოცავ! ყველა ტური წარმატებით გაიარე და ჭიამაია გადაარჩინე! დროა იხილო ფილოსოფიური ეპილოგი.",
        loseMsg: "სარდაფის ობობამ ჭიამაია დაიჭირა... შეუშალე ხელი ბარიერებით, რომ ქსელთან ახლოს არ მივიდეს!",
        returnToMenu: "🏠 მთავარ მენიუში დაბრუნება",
        epilogueHeader: "ეპილოგი",
        epilogueSub: "ფილოსოფიური ეტიუდი",
        epilogueHighlight: "„სანამ ცოცხალი ხარ, შენს ზურგზე ყოველთვის გაქვს ფრთები, რომლებსაც თავისუფლებისკენ აფრენა შეუძლიათ.“",
        endingTitle: "დასასრული",
        endingSub: "გმადლობთ, რომ გადაარჩინეთ ჭიამაია"
    },
    en: {
        gameTitle: "Save the Ladybug",
        subtitle: "Prevent the ladybug from reaching the cellar spider's web and help it fly to freedom!",
        startGame: "Start Game",
        selectLevel: "Select Level",
        viewEpilogue: "View Epilogue",
        settings: "Settings",
        howToPlay: "How to Play",
        levelSelectTitle: "Select Level",
        levelSelectSub: "Complete levels in sequence",
        close: "Close",
        rulesTitle: "Game Rules",
        rulesUnderstood: "Understood, Let's Play!",
        levelWonTitle: "Level Completed!",
        nextLevel: "Next Level ➔",
        viewEpilogueBtn: "View Epilogue ✨",
        gameOverTitle: "Caught by the spider...",
        tryAgain: "🔄 Try Again",
        spiderThreat: "Spider Threat:",
        soundButton: "Sound",
        settingsButton: "Settings",
        restartButton: "Restart Level",
        homeButton: "Main Menu",
        locked: "Locked",
        threatLevelTitle: "Threat Level",
        barriers: "Barriers",
        level: "Level",
        keyboardHint: "Click or tap to place a leaf.",
        dismissHint: "Dismiss",
        musicSettingLabel: "🎵 Music",
        soundSettingLabel: "🔊 Sound",
        audioEnabled: "On",
        audioDisabled: "Off",
        musicOn: "🎵 Music: ON",
        musicOff: "🎵 Music: OFF",
        skipToMenu: "Skip to Menu ➔",
        freedomSign: "🌿 Freedom",
        woohoo: "Woohoo! 🎉",
        scream: "Aaa! 😭",
        settingsTitle: "⚙️ Settings",
        ladybugColorLabel: "🐞 Ladybug Color",
        spiderColorLabel: "🕷️ Spider Color",
        languageLabel: "🌐 Game Language / თამაშის ენა",
        saveAndClose: "Save & Close",
        outOfBarriers: "Out of barriers! Tap directly on the ladybug to turn it around.",
        winMsgDefault: "Awesome! The ladybug was saved and happily flew out the window. Get ready for the next level!",
        winMsgFinal: "Congratulations! You completed all levels and saved the ladybug! Time to experience the philosophical epilogue.",
        loseMsg: "The cellar spider caught the ladybug... Place barriers to keep it away from the web!",
        returnToMenu: "🏠 Return to Main Menu",
        epilogueHeader: "Epilogue",
        epilogueSub: "A Philosophical Etude",
        epilogueHighlight: "“As long as you are alive, you always have wings upon your back, capable of taking flight toward freedom.”",
        endingTitle: "The End",
        endingSub: "Thank you for saving the ladybug"
    }
};

const RULES_KA = `
    <li>🐞 <span class="highlight">ჭიამაია</span> კედელზე ქვევიდან ზევით მიცოცავს.</li>
    <li>🕸️ ჭერთან იმალება <span class="highlight">სარდაფის ობობა (Cellar Spider)</span> თავისი წებოვანი ქსელით.</li>
    <li>🛡️ <span class="highlight">ხელის შეშლა:</span> მაუსით ან თითით დააწკაპუნე კედელზე, რომ განათავსო დამცავი ფოთოლი-ბარიერი, რომელიც ჭიამაიას მიმართულებას აცვლევინებს.</li>
    <li>👆 ჭიამაიაზე პირდაპირ შეხებით მას უკან შემოაბრუნებ.</li>
    <li>🌿 მიმართე ჭიამაია <span class="highlight">მზიანი ფანჯრისკენ</span>, რათა გაშალოს ფრთები, შესძახოს <b>„ვუჰუუ!“</b> და გაფრინდეს.</li>
    <li>⭐ სულ 5 ტურია: პირველი 2 სიუჟეტურია, ბოლო 3 კი რთული <b>Challenge</b> ტურები.</li>
`;

const RULES_EN = `
    <li>🐞 The <span class="highlight">Ladybug</span> crawls upwards on the room wall.</li>
    <li>🕸️ Near the ceiling lurks a <span class="highlight">Cellar Spider</span> with its sticky cobweb.</li>
    <li>🛡️ <span class="highlight">Intervene:</span> Click or tap anywhere on the wall to place a protective leaf barrier that deflects the ladybug away from danger.</li>
    <li>👆 Tap directly on the ladybug to startle it and make it turn around.</li>
    <li>🌿 Steer the ladybug safely to the sunny <span class="highlight">open window</span> so it can spread its wings, shout <b>“Woohoo!”</b>, and escape into freedom.</li>
    <li>⭐ There are 5 levels: the first 2 tell the story, while the final 3 are tougher <b>Challenge</b> levels.</li>
`;

// Level Configurations
const LEVELS = [
    {
        number: 1,
        titleKa: "ტური 1: პირველი ნაბიჯები კედელზე",
        descKa: "ჭიამაია მაღლა მიცოცავს. მარჯვენა კუთხეში ობობაა. დააწკაპუნე კედელზე ბარიერის დასადებად და მიმართე ჭიამაია მარცხნივ, ღია ფანჯრისკენ!",
        titleEn: "Level 1: First Steps on the Wall",
        descEn: "The ladybug crawls upward. A spider lurks in the right corner. Click on the wall to place a barrier leaf and steer the ladybug toward the open sunny window on the left!",
        ladybugSpeed: 1.15,
        spiders: [
            { x: 700, y: 70, webRadius: 170, hangLength: 0, maxHang: 0, patrolSpeed: 0 }
        ],
        windowX: 0,
        windowY: 260,
        windowW: 90,
        windowH: 260,
        maxBarriers: 5,
        webStrands: [
            { x1: 530, y1: 0, x2: 700, y2: 70 },
            { x1: 620, y1: 0, x2: 800, y2: 240 },
            { x1: 700, y1: 70, x2: 800, y2: 120 }
        ]
    },
    {
        number: 2,
        titleKa: "ტური 2: დიდი გაქცევა თავისუფლებისკენ (სიუჟეტის ფინალი)",
        descKa: "სიუჟეტის ფინალური დაძაბული ტური! ობობები აქტიურობენ და ქსელი თითქმის მთელ ჭერს ფარავს. გადაარჩინე ჭიამაია — ამის შემდეგ Challenge ტურები გელოდება!",
        titleEn: "Level 2: The Great Escape to Freedom (Story Finale)",
        descEn: "The story finale is intense: active spiders and webs cover the ceiling. Save the ladybug — three tougher Challenge levels await afterward!",
        ladybugSpeed: 1.75,
        spiders: [
            { x: 300, y: 75, webRadius: 200, hangLength: 20, maxHang: 120, patrolSpeed: 1.0, patrolMinX: 200, patrolMaxX: 450 },
            { x: 650, y: 75, webRadius: 210, hangLength: 30, maxHang: 120, patrolSpeed: -1.0, patrolMinX: 520, patrolMaxX: 730 }
        ],
        windowX: 0,
        windowY: 320,
        windowW: 95,
        windowH: 260,
        maxBarriers: 7,
        webStrands: [
            { x1: 150, y1: 0, x2: 300, y2: 75 },
            { x1: 300, y1: 75, x2: 500, y2: 0 },
            { x1: 500, y1: 0, x2: 650, y2: 75 },
            { x1: 650, y1: 75, x2: 800, y2: 230 }
        ]
    },
    {
        number: 3,
        titleKa: "ტური 3: Challenge — ოთხი ჩრდილი და ვიწრო მზის სხივი",
        descKa: "ოთხი ობობა ჭერს აკონტროლებს. მარცხენა ფანჯრის ქვემოთ დასაკეცი მაგიდა დგას, ფანჯარა კი ვიწროა და შუა სიმაღლეზეა — ჭიამაია ზუსტად უნდა შეიყვანო მზის სხივში!",
        titleEn: "Level 3: Challenge — Four Shadows and a Narrow Sunbeam",
        descEn: "Four spiders control the ceiling. A folding table stands below the narrow left window at mid-height — guide the ladybug precisely into the beam of sunlight!",
        ladybugSpeed: 1.95,
        windX: -20,
        spiders: [
            { x: 180, y: 78, webRadius: 135, hangLength: 35, maxHang: 190, patrolSpeed: 0.65, patrolMinX: 180, patrolMaxX: 260 },
            { x: 365, y: 85, webRadius: 150, hangLength: 30, maxHang: 165, patrolSpeed: -0.75, patrolMinX: 285, patrolMaxX: 450 },
            { x: 540, y: 75, webRadius: 150, hangLength: 40, maxHang: 195, patrolSpeed: 0.8, patrolMinX: 460, patrolMaxX: 625 },
            { x: 700, y: 88, webRadius: 135, hangLength: 28, maxHang: 155, patrolSpeed: -0.7, patrolMinX: 620, patrolMaxX: 760 }
        ],
        windowX: 0,
        windowY: 195,
        windowW: 78,
        windowH: 170,
        table: { x: 0, y: 427, width: 285, topHeight: 17, legBottomY: V_HEIGHT - 28 },
        maxBarriers: 5,
        webStrands: [
            { x1: 250, y1: 0, x2: 470, y2: 85 },
            { x1: 470, y1: 85, x2: 800, y2: 300 },
            { x1: 340, y1: 0, x2: 620, y2: 180 }
        ]
    },
    {
        number: 4,
        titleKa: "ტური 4: Challenge — სამი ჩრდილი და ვენტილატორი",
        descKa: "სამი ობობა აკონტროლებს ჭერს, თავისუფლების ფანჯარა კი მარჯვნივაა. მის ქვემოთ მაღალი ვენტილატორი დგას — გვერდიდან შემოუხვიე და ზუსტად შედი ფანჯარაში!",
        titleEn: "Level 4: Challenge — Three Shadows and a Fan",
        descEn: "Three spiders control the ceiling, while the freedom window is on the right. A tall fan blocks it from below — go around the side and enter the window precisely!",
        ladybugSpeed: 2.05,
        windX: 18,
        spiders: [
            { x: 150, y: 72, webRadius: 145, hangLength: 45, maxHang: 193, patrolSpeed: 0.7, patrolMinX: 90, patrolMaxX: 250 },
            { x: 455, y: 78, webRadius: 155, hangLength: 45, maxHang: 187, patrolSpeed: -0.8, patrolMinX: 350, patrolMaxX: 560 },
            { x: 700, y: 72, webRadius: 145, hangLength: 45, maxHang: 193, patrolSpeed: 0.65, patrolMinX: 610, patrolMaxX: 760 }
        ],
        windowX: V_WIDTH - 88,
        windowY: 135,
        windowW: 88,
        windowH: 150,
        fan: { x: V_WIDTH - 88, y: 300, width: 88, height: V_HEIGHT - 22 - 300 },
        maxBarriers: 6,
        webStrands: [
            { x1: 0, y1: 160, x2: 150, y2: 72 },
            { x1: 150, y1: 72, x2: 300, y2: 0 },
            { x1: 300, y1: 0, x2: 455, y2: 78 },
            { x1: 455, y1: 78, x2: 600, y2: 0 },
            { x1: 600, y1: 0, x2: 700, y2: 72 },
            { x1: 700, y1: 72, x2: 800, y2: 180 }
        ]
    },
    {
        number: 5,
        titleKa: "ტური 5: Challenge — უკანასკნელი ქარიშხალი",
        descKa: "ბოლო და ურთულესი გამოცდა: ფანჯარა თითქმის ჭერთანაა, მის პირდაპირ კი დიდი კარადა დგას. ობობები ოდნავ გვერდებზე არიან, მაგრამ ქარი ძლიერია და ბარიერები ცოტაა — ფანჯარასთან გვერდიდან შედი!",
        titleEn: "Level 5: Challenge — The Final Storm",
        descEn: "The hardest test: a large cabinet blocks the window from below. The spiders are slightly to the sides, but wind is strong and barriers are limited — approach the window from the side!",
        ladybugSpeed: 2.15,
        windX: 24,
        spiders: [
            { x: 330, y: 75, webRadius: 185, hangLength: 30, maxHang: 110, patrolSpeed: 1.05, patrolMinX: 220, patrolMaxX: 470 },
            { x: 700, y: 78, webRadius: 200, hangLength: 35, maxHang: 120, patrolSpeed: -1.05, patrolMinX: 560, patrolMaxX: 780 }
        ],
        windowX: 0,
        windowY: 75,
        windowW: 92,
        windowH: 130,
        cabinet: { x: 0, y: 205, width: 150, height: V_HEIGHT - 22 - 205 },
        maxBarriers: 5,
        webStrands: [
            { x1: 80, y1: 0, x2: 330, y2: 75 },
            { x1: 330, y1: 75, x2: 500, y2: 0 },
            { x1: 500, y1: 0, x2: 700, y2: 78 },
            { x1: 700, y1: 78, x2: 800, y2: 250 },
            { x1: 180, y1: 0, x2: 700, y2: 220 }
        ]
    }
];

// Epilogue Philosophical Texts
const EPILOGUE_TEXTS_KA = [
    `„ხშირად ცხოვრებაში, ისევე როგორც ეს პატარა ჭიამაია, ჩვენც თავდაუზოგავად მივისწრაფვით მაღლა — მწვერვალებისკენ, მიზნებისკენ, ისე რომ ვერც კი ვამჩნევთ, რა უხილავი ხაფანგები და დამღუპველი ქსელებია გაბმული ჭერქვეშ.“`,
    `„როდესაც ჩვენს გზაზე მოულოდნელი დაბრკოლება ჩნდება და წინსვლაში ხელს გვიშლის, ჩვენ ხშირად ვბრაზდებით, ვწუწუნებთ და ვერ ვხვდებით, რომ ეს სინამდვილეში მფარველი ხელია — ხელი, რომელმაც ობობის მომაკვდინებელ კლანჭებს აგვარიდა და სწორი მიმართულება გვაპოვნინა.“`,
    `„სარდაფის ობობა ბოროტი არ არის — ის უბრალოდ ბუნების შეუვალ ინსტინქტს ემორჩილება. მაგრამ ჭიამაიას ჭეშმარიტი ხსნა იმაში აღმოჩნდა, რომ მან ბრმად ცოცვა კი არ განაგრძო, არამედ საკუთარი წითელი ფრთები გაშალა და მზისკენ გაფრინდა.“`,
    `„ცხოვრების ყველაზე დიდი სიბრძნეც სწორედ ესაა: არასოდეს შეგეშინდეს მიმართულების შეცვლის, დააფასე უხილავი მფარველობა და გახსოვდეს — სანამ ცოცხალი ხარ, შენს ზურგზე ყოველთვის გაქვს ფრთები, რომლებსაც თავისუფლებისკენ აფრენა შეუძლიათ.“`
];

const EPILOGUE_TEXTS_EN = [
    `“Often in life, just like this little ladybug, we strive ceaselessly upward — climbing toward summits and ambitions, scarcely noticing the invisible traps and perilous webs spun beneath the ceiling.”`,
    `“When an unexpected obstacle arises in our path and hinders our advance, we often grow frustrated and bitter, failing to realize that it may in truth be a guardian hand — turning us away from deadly clutches and guiding us toward our true course.”`,
    `“The cellar spider is not evil; it simply obeys nature’s unbending instinct. Yet the ladybug’s true salvation lay not in crawling blindly ahead, but in opening its wings and flying toward the sun.”`,
    `“Perhaps life’s greatest wisdom is this: never fear changing direction, cherish the unseen hands that steer you, and remember — as long as you live, you carry wings upon your back that can always take flight toward freedom.”`
];

const SETTINGS_STORAGE_KEY = 'save_coccinellidae_settings';
const PROGRESS_STORAGE_KEY = 'save_coccinellidae_progress';

class Game {
    constructor() {
        this.state = STATE.MENU;
        this.isPaused = false;
        this.currentLevelIndex = 0;
        this.progress = this.loadProgress();
        this.unlockedLevels = this.progress.unlockedLevels;

        // Settings (Ladybug color, Spider color, Audio, Language)
        this.settings = this.loadSettings();
        if (window.soundEngine) {
            window.soundEngine.setMusicMuted(Boolean(this.settings.musicMuted));
            window.soundEngine.setSoundMuted(Boolean(this.settings.soundMuted));
        }

        // Entities
        this.ladybug = null;
        this.spiders = [];
        this.barriers = [];
        this.particles = [];
        this.dustParticles = [];

        // Interaction
        this.barriersLeft = 5;
        this.lastClickTime = 0;

        // Animation Timers
        this.animTimer = 0;
        this.speechBubble = null;
        this.attackSpider = null;
        this.ceilingCatch = null;
        this.screenShake = 0;

        // Room ambiance
        this.initDustParticles();
        this.setupEventListeners();

        // Apply settings & language to DOM
        this.applyLanguage();
        document.documentElement.classList.remove('app-loading');

        // Game Loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loadSettings() {
        const defaults = {
            ladybugColor: 'red',
            spiderColor: 'classic',
            language: this.getDefaultLanguage(),
            musicMuted: false,
            soundMuted: false
        };

        try {
            const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    const settings = Object.assign({}, defaults, parsed);
                    // Migrate the old single mute switch to both new controls.
                    if (typeof parsed.musicMuted !== 'boolean' && typeof parsed.muted === 'boolean') {
                        settings.musicMuted = parsed.muted;
                    }
                    if (typeof parsed.soundMuted !== 'boolean' && typeof parsed.muted === 'boolean') {
                        settings.soundMuted = parsed.muted;
                    }
                    return settings;
                }
            }
        } catch (e) {
            console.warn('Could not read settings from localStorage', e);
        }
        return defaults;
    }

    getDefaultLanguage() {
        return typeof navigator !== 'undefined' && /^ka(?:-|$)/i.test(navigator.language || '') ? 'ka' : 'en';
    }

    loadProgress() {
        const fallback = { unlockedLevels: 1 };
        try {
            const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || 'null');
            if (!saved || typeof saved !== 'object') return fallback;
            const unlockedLevels = Math.max(1, Math.min(LEVELS.length, Number(saved.unlockedLevels) || 1));
            return { unlockedLevels };
        } catch (e) {
            console.warn('Could not read progress from localStorage', e);
            return fallback;
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Could not save progress to localStorage', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage', e);
        }
    }

    getLevelTitle(idx) {
        const lvl = LEVELS[idx];
        return this.settings.language === 'en' ? lvl.titleEn : lvl.titleKa;
    }

    getLevelDescription(idx) {
        const lvl = LEVELS[idx];
        return this.settings.language === 'en' ? lvl.descEn : lvl.descKa;
    }

    applyLanguage() {
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        document.documentElement.lang = this.settings.language === 'en' ? 'en' : 'ka';

        const elThreat = document.getElementById('txt-spider-threat');
        if (elThreat) elThreat.textContent = t.spiderThreat;

        const hudTitles = {
            'btn-settings-hud': t.settingsButton,
            'btn-restart': t.restartButton,
            'btn-home': t.homeButton,
            'hud-threat-badge': t.threatLevelTitle
        };
        Object.entries(hudTitles).forEach(([id, title]) => {
            const button = document.getElementById(id);
            if (button) button.setAttribute('title', title);
        });

        // Main Titles
        const elGameTitle = document.getElementById('txt-game-title');
        if (elGameTitle) elGameTitle.textContent = t.gameTitle;
        const elSub = document.getElementById('txt-game-subtitle');
        if (elSub) elSub.textContent = t.subtitle;

        // Menu Buttons
        const elStart = document.getElementById('txt-start-game');
        if (elStart) elStart.textContent = t.startGame;
        const elLvl = document.getElementById('txt-select-level');
        if (elLvl) elLvl.textContent = t.selectLevel;
        const elEpi = document.getElementById('txt-menu-epilogue');
        if (elEpi) elEpi.textContent = t.viewEpilogue;
        const elSet = document.getElementById('txt-settings');
        if (elSet) elSet.textContent = t.settings;
        const elHow = document.getElementById('txt-how-to-play');
        if (elHow) elHow.textContent = t.howToPlay;

        // Level Select Modal
        const elLvlTitle = document.getElementById('txt-level-select-title');
        if (elLvlTitle) elLvlTitle.textContent = t.levelSelectTitle;
        const elLvlSub = document.getElementById('txt-level-select-sub');
        if (elLvlSub) elLvlSub.textContent = t.levelSelectSub;
        const elLvlClose = document.getElementById('txt-level-close');
        if (elLvlClose) elLvlClose.textContent = t.close;

        // Settings Modal
        const elSetTitle = document.getElementById('txt-settings-title');
        if (elSetTitle) elSetTitle.textContent = t.settingsTitle;
        const elLadyLabel = document.getElementById('txt-ladybug-color-label');
        if (elLadyLabel) elLadyLabel.textContent = t.ladybugColorLabel;
        const elSpiderLabel = document.getElementById('txt-spider-color-label');
        if (elSpiderLabel) elSpiderLabel.textContent = t.spiderColorLabel;
        const elLangLabel = document.getElementById('txt-language-label');
        if (elLangLabel) elLangLabel.textContent = t.languageLabel;
        const elSetSave = document.getElementById('txt-settings-save');
        if (elSetSave) elSetSave.textContent = t.saveAndClose;

        const musicSettingLabel = document.getElementById('txt-music-setting-label');
        if (musicSettingLabel) musicSettingLabel.textContent = t.musicSettingLabel;
        const soundSettingLabel = document.getElementById('txt-sound-setting-label');
        if (soundSettingLabel) soundSettingLabel.textContent = t.soundSettingLabel;

        const musicSetting = document.getElementById('btn-music-setting');
        const musicSettingIcon = document.getElementById('music-setting-icon');
        const musicSettingState = document.getElementById('txt-music-setting-state');
        if (musicSetting) {
            const musicMuted = Boolean(this.settings.musicMuted);
            if (musicSettingIcon) musicSettingIcon.textContent = musicMuted ? '🔇' : '🔊';
            if (musicSettingState) musicSettingState.textContent = musicMuted ? t.audioDisabled : t.audioEnabled;
            musicSetting.setAttribute('aria-label', `${t.musicSettingLabel}: ${musicMuted ? t.audioDisabled : t.audioEnabled}`);
            musicSetting.setAttribute('aria-pressed', String(musicMuted));
        }

        const soundSetting = document.getElementById('btn-sound-setting');
        const soundSettingIcon = document.getElementById('sound-setting-icon');
        const soundSettingState = document.getElementById('txt-sound-setting-state');
        if (soundSetting) {
            const soundMuted = Boolean(this.settings.soundMuted);
            if (soundSettingIcon) soundSettingIcon.textContent = soundMuted ? '🔇' : '🔊';
            if (soundSettingState) soundSettingState.textContent = soundMuted ? t.audioDisabled : t.audioEnabled;
            soundSetting.setAttribute('aria-label', `${t.soundSettingLabel}: ${soundMuted ? t.audioDisabled : t.audioEnabled}`);
            soundSetting.setAttribute('aria-pressed', String(soundMuted));
        }

        // Rules Modal
        const elRulesTitle = document.getElementById('txt-rules-title');
        if (elRulesTitle) elRulesTitle.textContent = t.rulesTitle;
        const elRulesList = document.getElementById('rules-list-container');
        if (elRulesList) elRulesList.innerHTML = this.settings.language === 'en' ? RULES_EN : RULES_KA;
        const elRulesClose = document.getElementById('txt-rules-close');
        if (elRulesClose) elRulesClose.textContent = t.rulesUnderstood;

        const helpDismiss = document.getElementById('btn-help-dismiss');
        if (helpDismiss) {
            helpDismiss.setAttribute('aria-label', t.dismissHint);
            helpDismiss.title = t.dismissHint;
        }

        // Result Modals
        const elWinTitle = document.getElementById('txt-win-title');
        if (elWinTitle) elWinTitle.textContent = t.levelWonTitle;
        const elLoseTitle = document.getElementById('txt-lose-title');
        if (elLoseTitle) elLoseTitle.textContent = t.gameOverTitle;
        const elTryAgain = document.getElementById('btn-try-again');
        if (elTryAgain) elTryAgain.textContent = t.tryAgain;
        const elWinMenu = document.getElementById('btn-win-menu');
        if (elWinMenu) elWinMenu.textContent = t.returnToMenu;
        const elGameOverMenu = document.getElementById('btn-gameover-menu');
        if (elGameOverMenu) elGameOverMenu.textContent = t.returnToMenu;

        // Epilogue Texts
        const elEpiHead = document.getElementById('txt-epilogue-header');
        if (elEpiHead) elEpiHead.textContent = t.epilogueHeader;
        const elEpiSub = document.getElementById('txt-epilogue-sub');
        if (elEpiSub) elEpiSub.textContent = t.epilogueSub;
        const elEpiHigh = document.getElementById('txt-epilogue-highlight');
        if (elEpiHigh) elEpiHigh.textContent = t.epilogueHighlight;
        const elEndTitle = document.getElementById('txt-ending-title');
        if (elEndTitle) elEndTitle.textContent = t.endingTitle;
        const elEndSub = document.getElementById('txt-ending-sub');
        if (elEndSub) elEndSub.textContent = t.endingSub;
        const elEpiSkip = document.getElementById('txt-epilogue-skip');
        if (elEpiSkip) elEpiSkip.textContent = t.skipToMenu;

        // Active Language Button
        const btnKa = document.getElementById('lang-btn-ka');
        if (btnKa) {
            btnKa.classList.toggle('active', this.settings.language === 'ka');
            btnKa.setAttribute('aria-pressed', String(this.settings.language === 'ka'));
        }
        const btnEn = document.getElementById('lang-btn-en');
        if (btnEn) {
            btnEn.classList.toggle('active', this.settings.language === 'en');
            btnEn.setAttribute('aria-pressed', String(this.settings.language === 'en'));
        }

        // Update logo color to match selected ladybug color
        const logoBody = document.getElementById('logo-ladybug-body');
        if (logoBody) {
            const pal = LADYBUG_PALETTES[this.settings.ladybugColor] || LADYBUG_PALETTES.red;
            logoBody.setAttribute('fill', pal.base);
        }

        this.updateHUD();
        this.renderColorPickers();
    }

    renderColorPickers() {
        const isEn = this.settings.language === 'en';
        const ladybugContainer = document.getElementById('ladybug-color-picker');
        const spiderContainer = document.getElementById('spider-color-picker');

        if (ladybugContainer) {
            ladybugContainer.innerHTML = '';
            Object.entries(LADYBUG_PALETTES).forEach(([key, pal]) => {
                const btn = document.createElement('button');
                btn.className = `color-swatch-btn ${this.settings.ladybugColor === key ? 'active' : ''}`;
                btn.innerHTML = `<span class="swatch-circle" style="background: ${pal.base};"></span> <span>${isEn ? pal.nameEn : pal.nameKa}</span>`;
                btn.addEventListener('click', () => {
                    this.settings.ladybugColor = key;
                    this.saveSettings();
                    this.renderColorPickers();
                    const logoBody = document.getElementById('logo-ladybug-body');
                    if (logoBody) logoBody.setAttribute('fill', pal.base);
                });
                ladybugContainer.appendChild(btn);
            });
        }

        if (spiderContainer) {
            spiderContainer.innerHTML = '';
            Object.entries(SPIDER_PALETTES).forEach(([key, pal]) => {
                const btn = document.createElement('button');
                btn.className = `color-swatch-btn ${this.settings.spiderColor === key ? 'active' : ''}`;
                btn.innerHTML = `<span class="swatch-circle" style="background: ${pal.body};"></span> <span>${isEn ? pal.nameEn : pal.nameKa}</span>`;
                btn.addEventListener('click', () => {
                    this.settings.spiderColor = key;
                    this.saveSettings();
                    this.renderColorPickers();
                });
                spiderContainer.appendChild(btn);
            });
        }
    }

    openSettings() {
        this.renderColorPickers();
        this.isPaused = true;
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
        this.isPaused = false;
        this.updateHUD();
        if (this.state === STATE.MENU) window.soundEngine.startMenuMusic();
    }

    initDustParticles() {
        this.dustParticles = [];
        for (let i = 0; i < 35; i++) {
            this.dustParticles.push({
                x: Math.random() * V_WIDTH,
                y: Math.random() * V_HEIGHT,
                radius: Math.random() * 1.8 + 0.6,
                speedY: Math.random() * -0.35 - 0.1,
                speedX: (Math.random() - 0.5) * 0.25,
                alpha: Math.random() * 0.45 + 0.15
            });
        }
    }

    loadLevel(index) {
        if (index < 0) index = 0;
        if (index >= LEVELS.length) index = LEVELS.length - 1;
        window.soundEngine.stopMenuMusic();
        this.currentLevelIndex = index;
        this.isPaused = false;
        const cfg = LEVELS[index];

        this.barriers = [];
        this.particles = [];
        this.barriersLeft = cfg.maxBarriers;
        this.speechBubble = null;
        this.attackSpider = null;
        this.animTimer = 0;
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.remove('hidden');

        // Spawn Ladybug at bottom
        this.ladybug = {
            x: V_WIDTH * 0.55 + (Math.random() - 0.5) * 120,
            y: V_HEIGHT - 65,
            radius: 17,
            angle: -Math.PI / 2, // Facing UP
            speed: cfg.ladybugSpeed,
            turnRate: 0.05,
            targetAngle: -Math.PI / 2,
            legPhase: 0,
            wingOpen: 0, // 0: closed, 1: fully open
            wingFlap: 0,
            happySmile: false,
            crying: false,
            tearPhase: 0,
            isDead: false,
            isSafe: false
        };

        // Spawn Spiders
        this.spiders = cfg.spiders.map(s => ({
            originX: s.x,
            originY: s.y,
            x: s.x,
            y: s.y,
            bodyRadius: 13,
            webRadius: s.webRadius,
            hangLength: s.hangLength || 0,
            targetHang: s.hangLength || 0,
            maxHang: s.maxHang || 0,
            hangSpeed: 0.5,
            hangTimer: Math.random() * 10,
            patrolSpeed: s.patrolSpeed || 0,
            patrolMinX: s.patrolMinX || (s.x - 50),
            patrolMaxX: s.patrolMaxX || (s.x + 50),
            legJitter: 0,
            eyeGlow: 0,
            attacking: false
        }));

        this.updateHUD();
        window.soundEngine.playLevelStart();
        this.state = STATE.PLAYING;

        // Show banner helper
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        this.showHelpBanner(`${this.getLevelTitle(index)} — ${this.getLevelDescription(index)} ${t.keyboardHint}`);
    }

    showHelpBanner(text) {
        const banner = document.getElementById('help-banner');
        const bannerText = document.getElementById('help-banner-text');
        if (banner) {
            if (bannerText) bannerText.textContent = text;
            else banner.textContent = text;
            banner.classList.remove('hidden');
            clearTimeout(this.bannerTimer);
            this.bannerTimer = setTimeout(() => {
                banner.classList.add('hidden');
            }, 6000);
        }
    }

    setupEventListeners() {
        // Canvas pointer input works consistently for mouse, touch, and pen.
        const handleInteraction = (e) => {
            if (this.state !== STATE.PLAYING) return;
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const scaleX = V_WIDTH / rect.width;
            const scaleY = V_HEIGHT / rect.height;

            const clientX = e.clientX;
            const clientY = e.clientY;

            const mouseX = (clientX - rect.left) * scaleX;
            const mouseY = (clientY - rect.top) * scaleY;

            this.placeBarrierOrNudge(mouseX, mouseY);
        };

        canvas.addEventListener('pointerdown', handleInteraction, { passive: false });

        const mainMenu = document.getElementById('main-menu-overlay');
        if (mainMenu) {
            mainMenu.addEventListener('pointerdown', () => {
                if (this.state === STATE.MENU) window.soundEngine.startMenuMusic();
            });
        }

        // HUD Buttons
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.loadLevel(this.currentLevelIndex);
        });

        document.getElementById('btn-home').addEventListener('click', () => {
            this.returnToMenu();
        });

        // Menu Buttons
        document.getElementById('btn-start-game').addEventListener('click', () => {
            window.soundEngine.init();
            document.getElementById('main-menu-overlay').classList.add('hidden');
            this.loadLevel(0);
        });

        document.getElementById('btn-select-level').addEventListener('click', () => {
            this.openLevelSelect();
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.remove('hidden');
        });

        document.getElementById('btn-rules-close').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.add('hidden');
        });

        const helpDismiss = document.getElementById('btn-help-dismiss');
        if (helpDismiss) {
            helpDismiss.addEventListener('click', event => {
                event.stopPropagation();
                const banner = document.getElementById('help-banner');
                if (banner) banner.classList.add('hidden');
                clearTimeout(this.bannerTimer);
            });
        }

        document.getElementById('btn-level-close').addEventListener('click', () => {
            document.getElementById('level-select-modal').classList.add('hidden');
        });

        document.getElementById('btn-menu-epilogue').addEventListener('click', () => {
            this.showEpilogue();
        });

        // Settings Buttons & Handlers
        const btnSettingsMenu = document.getElementById('btn-settings');
        if (btnSettingsMenu) {
            btnSettingsMenu.addEventListener('click', () => {
                this.openSettings();
            });
        }

        const btnSettingsHud = document.getElementById('btn-settings-hud');
        if (btnSettingsHud) {
            btnSettingsHud.addEventListener('click', () => {
                this.openSettings();
            });
        }

        const btnSettingsClose = document.getElementById('btn-settings-close');
        if (btnSettingsClose) {
            btnSettingsClose.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        document.getElementById('btn-music-setting').addEventListener('click', () => {
            this.settings.musicMuted = !this.settings.musicMuted;
            window.soundEngine.setMusicMuted(this.settings.musicMuted);
            this.saveSettings();
            this.applyLanguage();
        });

        document.getElementById('btn-sound-setting').addEventListener('click', () => {
            this.settings.soundMuted = !this.settings.soundMuted;
            window.soundEngine.setSoundMuted(this.settings.soundMuted);
            this.saveSettings();
            this.applyLanguage();
        });

        const btnLangKa = document.getElementById('lang-btn-ka');
        if (btnLangKa) {
            btnLangKa.addEventListener('click', () => {
                this.settings.language = 'ka';
                this.saveSettings();
                this.applyLanguage();
            });
        }

        const btnLangEn = document.getElementById('lang-btn-en');
        if (btnLangEn) {
            btnLangEn.addEventListener('click', () => {
                this.settings.language = 'en';
                this.saveSettings();
                this.applyLanguage();
            });
        }

        // Result Dialogs
        document.getElementById('btn-next-level').addEventListener('click', () => {
            document.getElementById('win-modal').classList.add('hidden');
            if (this.currentLevelIndex + 1 < LEVELS.length) {
                this.loadLevel(this.currentLevelIndex + 1);
            } else {
                this.showEpilogue();
            }
        });

        document.getElementById('btn-try-again').addEventListener('click', () => {
            document.getElementById('lose-modal').classList.add('hidden');
            this.loadLevel(this.currentLevelIndex);
        });

        document.getElementById('btn-win-menu').addEventListener('click', () => {
            this.returnToMenu();
        });

        document.getElementById('btn-gameover-menu').addEventListener('click', () => {
            this.returnToMenu();
        });

        const skipBtn = document.getElementById('btn-epilogue-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.closeEpilogue();
            });
        }

        // Escape closes transient dialogs; Space/Enter can still startle the
        // ladybug when a keyboard shortcut is preferred.
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state === STATE.EPILOGUE) this.closeEpilogue();
                else if (this.state === STATE.PLAYING) {
                    const settingsModal = document.getElementById('settings-modal');
                    if (settingsModal && !settingsModal.classList.contains('hidden')) this.closeSettings();
                    else this.returnToMenu();
                }
                else {
                    this.closeSettings();
                    document.getElementById('rules-modal').classList.add('hidden');
                    document.getElementById('level-select-modal').classList.add('hidden');
                }
                return;
            }

            if (this.state !== STATE.PLAYING || !this.ladybug) return;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.placeBarrierOrNudge(this.ladybug.x, this.ladybug.y);
            }
        });
    }

    placeBarrierOrNudge(x, y) {
        window.soundEngine.init();

        // 1. Direct tap on Ladybug: scare it into spinning/reversing away
        const distToLadybug = Math.hypot(x - this.ladybug.x, y - this.ladybug.y);
        if (distToLadybug < 42) {
            // Turn ladybug 180 deg or towards safe window
            this.ladybug.targetAngle += Math.PI * 0.75;
            this.createPuff(this.ladybug.x, this.ladybug.y, '#f4a261');
            window.soundEngine.playNudge();
            this.spawnRipple(x, y);
            return;
        }

        // 2. Click on wall: place an obstacle leaf / gentle barrier
        if (this.barriersLeft > 0) {
            this.barriersLeft--;
            this.updateHUD();

            // Barrier angle: angled to deflect upward-moving bug toward window
            const angle = (x > V_WIDTH / 2) ? -Math.PI / 4 : -Math.PI * 3 / 4;

            this.barriers.push({
                x: x,
                y: y,
                radius: 28,
                length: 56,
                angle: angle,
                maxLife: 360, // 6 seconds
                life: 360,
                opacity: 1
            });

            this.spawnRipple(x, y);
            this.createPuff(x, y, '#2a9d8f');
            window.soundEngine.playNudge();
        } else {
            // Out of barriers: gentle warning ripple
            this.spawnRipple(x, y, '#e63946');
            const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
            this.showHelpBanner(t.outOfBarriers);
        }
    }

    spawnRipple(x, y, color = '#ffffff') {
        this.particles.push({
            type: 'ripple',
            x: x,
            y: y,
            radius: 5,
            maxRadius: 36,
            color: color,
            alpha: 0.9,
            fadeRate: 0.035
        });
    }

    createPuff(x, y, color = '#2a9d8f') {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            this.particles.push({
                type: 'dust',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 2,
                color: color,
                alpha: 0.85,
                decay: 0.04
            });
        }
    }

    updateHUD() {
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        const levelText = document.getElementById('hud-level-text');
        if (levelText) levelText.textContent = `${t.level} ${this.currentLevelIndex + 1} / ${LEVELS.length}`;

        const barCount = document.getElementById('hud-barrier-count');
        if (barCount) barCount.textContent = `${t.barriers}: ${this.barriersLeft}`;
    }

    openLevelSelect() {
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';

        LEVELS.forEach((lvl, idx) => {
            const btn = document.createElement('button');
            btn.className = 'level-tile';
            btn.type = 'button';
            btn.textContent = lvl.number;
            btn.setAttribute('aria-label', `${t.level} ${lvl.number}`);

            if (idx + 1 <= this.unlockedLevels) {
                if (idx < this.currentLevelIndex) btn.classList.add('completed');
                btn.addEventListener('click', () => {
                    document.getElementById('level-select-modal').classList.add('hidden');
                    document.getElementById('main-menu-overlay').classList.add('hidden');
                    this.loadLevel(idx);
                });
            } else {
                btn.classList.add('locked');
                btn.title = t.locked;
                btn.disabled = true;
            }
            grid.appendChild(btn);
        });

        document.getElementById('level-select-modal').classList.remove('hidden');
    }

    returnToMenu() {
        this.state = STATE.MENU;
        this.isPaused = false;
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        document.getElementById('win-modal').classList.add('hidden');
        document.getElementById('lose-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('rules-modal').classList.add('hidden');
        document.getElementById('level-select-modal').classList.add('hidden');
        document.getElementById('main-menu-overlay').classList.remove('hidden');
        const banner = document.getElementById('help-banner');
        if (banner) banner.classList.add('hidden');
        window.soundEngine.stopEpilogueMusic();
        window.soundEngine.startMenuMusic();
    }

    showEpilogue() {
        this.state = STATE.EPILOGUE;
        this.isPaused = false;
        const modal = document.getElementById('epilogue-overlay');
        const container = document.getElementById('epilogue-texts');
        const crawlEl = document.getElementById('epilogue-crawl');
        container.innerHTML = '';

        const texts = this.settings.language === 'en' ? EPILOGUE_TEXTS_EN : EPILOGUE_TEXTS_KA;
        texts.forEach((text, i) => {
            const p = document.createElement('p');
            p.textContent = text;
            container.appendChild(p);
        });

        modal.classList.remove('hidden');

        // Restart movie credits crawl animation
        if (crawlEl) {
            crawlEl.classList.remove('crawling');
            void crawlEl.offsetHeight; // force reflow
            crawlEl.classList.add('crawling');

            // When all text finishes crawling past the top of the screen:
            // Automatically return to main menu!
            if (this._onCrawlEndHandler) {
                crawlEl.removeEventListener('animationend', this._onCrawlEndHandler);
            }
            this._onCrawlEndHandler = () => {
                if (this.state === STATE.EPILOGUE) {
                    this.closeEpilogue();
                }
            };
            crawlEl.addEventListener('animationend', this._onCrawlEndHandler);
        }

        window.soundEngine.startEpilogueMusic();
    }

    closeEpilogue() {
        const modal = document.getElementById('epilogue-overlay');
        const crawlEl = document.getElementById('epilogue-crawl');
        if (crawlEl) {
            crawlEl.classList.remove('crawling');
            if (this._onCrawlEndHandler) {
                crawlEl.removeEventListener('animationend', this._onCrawlEndHandler);
            }
        }
        modal.classList.add('hidden');
        window.soundEngine.stopEpilogueMusic();
        this.returnToMenu();
    }

    // Main Game Loop
    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.isPaused) return;

        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt);
        }

        // Always update dust particles
        this.dustParticles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) p.y = V_HEIGHT;
            if (p.x < 0) p.x = V_WIDTH;
            if (p.x > V_WIDTH) p.x = 0;
        });

        // Always update ripples/particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            if (pt.type === 'ripple') {
                pt.radius += (pt.maxRadius - pt.radius) * 0.15;
                pt.alpha -= pt.fadeRate;
                if (pt.alpha <= 0) this.particles.splice(i, 1);
            } else if (pt.type === 'dust' || pt.type === 'confetti') {
                pt.x += pt.vx;
                pt.y += pt.vy;
                if (pt.gravity) pt.vy += pt.gravity;
                pt.alpha -= pt.decay;
                if (pt.alpha <= 0) this.particles.splice(i, 1);
            }
        }

        if (this.state === STATE.PLAYING) {
            this.updatePlaying(dt);
        } else if (this.state === STATE.WIN_ANIMATION) {
            this.updateWinAnimation(dt);
        } else if (this.state === STATE.LOSE_ANIMATION) {
            this.updateLoseAnimation(dt);
        } else if (this.state === STATE.CEILING_CATCH) {
            this.updateCeilingCatch(dt);
        }
    }

    updatePlaying(dt) {
        const bug = this.ladybug;
        const cfg = LEVELS[this.currentLevelIndex];

        // 1. Ladybug wandering & natural crawling motion
        bug.legPhase += dt * 15 * (bug.speed / 1.2);

        // Angle smoothing towards targetAngle
        let diff = bug.targetAngle - bug.angle;
        // Normalize angle
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        bug.angle += diff * bug.turnRate;

        // Subtle organic insect micro-wobble
        bug.targetAngle += (Math.random() - 0.5) * 0.04;

        // Ladybug tends to crawl up towards ceiling by default
        if (Math.sin(bug.angle) > -0.2) {
            // drifting downwards or horizontal, gently steer back up unless turned by barrier
            bug.targetAngle -= 0.005;
        }

        // Move bug
        bug.x += Math.cos(bug.angle) * bug.speed + (cfg.windX || 0) * dt;
        bug.y += Math.sin(bug.angle) * bug.speed + (cfg.windY || 0) * dt;

        // Keep inside horizontal walls
        if (bug.x < bug.radius + 5) {
            bug.x = bug.radius + 5;
            bug.targetAngle = 0; // Turn right
        } else if (bug.x > V_WIDTH - bug.radius - 5) {
            bug.x = V_WIDTH - bug.radius - 5;
            bug.targetAngle = Math.PI; // Turn left
        }

        // Floor collision
        if (bug.y > V_HEIGHT - bug.radius - 20) {
            bug.y = V_HEIGHT - bug.radius - 20;
            bug.targetAngle = -Math.PI / 2;
        }

        // If the ladybug completely leaves through the ceiling, do not let it
        // keep moving forever. The nearest spider follows it off-screen and
        // returns with it before the normal lose animation begins.
        if (bug.y < -40) {
            this.startCeilingCatch();
            return;
        }

        // 2. Update Barriers
        for (let i = this.barriers.length - 1; i >= 0; i--) {
            const b = this.barriers[i];
            b.life--;
            b.opacity = Math.max(0, b.life / b.maxLife);

            // Check collision with ladybug
            const dist = Math.hypot(bug.x - b.x, bug.y - b.y);
            if (dist < bug.radius + b.radius * 0.65) {
                // Deflect ladybug away from barrier!
                const repelAngle = Math.atan2(bug.y - b.y, bug.x - b.x);
                bug.targetAngle = repelAngle + (Math.random() - 0.5) * 0.4;
                bug.speed = cfg.ladybugSpeed * 1.2; // slight panic speedup

                this.spawnRipple(bug.x, bug.y, '#2a9d8f');
                window.soundEngine.playNudge();
                // Barrier takes wear
                b.life -= 60;
            }

            if (b.life <= 0) {
                this.barriers.splice(i, 1);
            }
        }

        // 3. Level obstacle collision: cabinets are solid rectangles. The fan
        // below uses only its actual head, stand and base as solid geometry,
        // so the empty space around it remains traversable.
        const cabinet = cfg.cabinet;
        if (cabinet) {
            const nearestX = Math.max(cabinet.x, Math.min(bug.x, cabinet.x + cabinet.width));
            const nearestY = Math.max(cabinet.y, Math.min(bug.y, cabinet.y + cabinet.height));
            let pushX = bug.x - nearestX;
            let pushY = bug.y - nearestY;
            const distance = Math.hypot(pushX, pushY);

            if (distance < bug.radius) {
                if (distance > 0.001) {
                    const pushDistance = bug.radius - distance + 0.5;
                    pushX /= distance;
                    pushY /= distance;
                    bug.x += pushX * pushDistance;
                    bug.y += pushY * pushDistance;
                } else {
                    // If the bug is fully inside the rectangle, eject it through
                    // the nearest side rather than letting it tunnel through.
                    const distances = [
                        { side: 'left', value: Math.abs(bug.x - cabinet.x) },
                        { side: 'right', value: Math.abs(cabinet.x + cabinet.width - bug.x) },
                        { side: 'top', value: Math.abs(bug.y - cabinet.y) },
                        { side: 'bottom', value: Math.abs(cabinet.y + cabinet.height - bug.y) }
                    ];
                    const nearestSide = distances.sort((a, b) => a.value - b.value)[0].side;
                    if (nearestSide === 'left') bug.x = cabinet.x - bug.radius - 0.5;
                    if (nearestSide === 'right') bug.x = cabinet.x + cabinet.width + bug.radius + 0.5;
                    if (nearestSide === 'top') bug.y = cabinet.y - bug.radius - 0.5;
                    if (nearestSide === 'bottom') bug.y = cabinet.y + cabinet.height + bug.radius + 0.5;
                }

                const fromLeft = bug.x < cabinet.x;
                const fromRight = bug.x > cabinet.x + cabinet.width;
                const fromTop = bug.y < cabinet.y;
                bug.targetAngle = fromLeft ? Math.PI : fromRight ? 0 : fromTop ? -Math.PI / 2 : Math.PI / 2;
                bug.speed = cfg.ladybugSpeed;
                this.spawnRipple(bug.x, bug.y, '#b87945');
            }
        }

        const fan = cfg.fan;
        if (fan) {
            const fanCenterX = fan.x + fan.width / 2;
            const fanBladeRadius = Math.min(fan.width * 0.4, 36);
            const fanHeadRadius = fanBladeRadius + 5;
            const fanHeadY = fan.y + fanBladeRadius + 12;
            const floorY = V_HEIGHT - 22;
            const fanParts = [
                { type: 'circle', x: fanCenterX, y: fanHeadY, radius: fanHeadRadius },
                { type: 'rect', x: fanCenterX - 5, y: fanHeadY + fanHeadRadius - 7, width: 10, height: floorY - (fanHeadY + fanHeadRadius - 7) },
                { type: 'circle', x: fanCenterX, y: floorY - 5, radius: fan.width * 0.38 }
            ];

            for (const part of fanParts) {
                let pushX;
                let pushY;
                let distance;
                let overlap;

                if (part.type === 'circle') {
                    pushX = bug.x - part.x;
                    pushY = bug.y - part.y;
                    distance = Math.hypot(pushX, pushY);
                    overlap = bug.radius + part.radius - distance + 0.5;

                    if (overlap > 0 && distance <= 0.001) {
                        // A centered bug is pushed upward out of the fan head/base.
                        pushX = 0;
                        pushY = -1;
                        distance = 1;
                    }
                } else {
                    const nearestX = Math.max(part.x, Math.min(bug.x, part.x + part.width));
                    const nearestY = Math.max(part.y, Math.min(bug.y, part.y + part.height));
                    pushX = bug.x - nearestX;
                    pushY = bug.y - nearestY;
                    distance = Math.hypot(pushX, pushY);
                    overlap = bug.radius - distance + 0.5;

                    if (overlap > 0 && distance <= 0.001) {
                        const distances = [
                            { side: 'left', value: Math.abs(bug.x - part.x) },
                            { side: 'right', value: Math.abs(part.x + part.width - bug.x) },
                            { side: 'top', value: Math.abs(bug.y - part.y) },
                            { side: 'bottom', value: Math.abs(part.y + part.height - bug.y) }
                        ];
                        const nearestSide = distances.sort((a, b) => a.value - b.value)[0].side;
                        if (nearestSide === 'left') {
                            bug.x = part.x - bug.radius - 0.5;
                            pushX = -1;
                            pushY = 0;
                        } else if (nearestSide === 'right') {
                            bug.x = part.x + part.width + bug.radius + 0.5;
                            pushX = 1;
                            pushY = 0;
                        } else if (nearestSide === 'top') {
                            bug.y = part.y - bug.radius - 0.5;
                            pushX = 0;
                            pushY = -1;
                        } else {
                            bug.y = part.y + part.height + bug.radius + 0.5;
                            pushX = 0;
                            pushY = 1;
                        }
                        distance = 1;
                    }
                }

                if (overlap > 0) {
                    if (distance > 0.001) {
                        pushX /= distance;
                        pushY /= distance;
                        bug.x += pushX * overlap;
                        bug.y += pushY * overlap;
                    }
                    bug.targetAngle = Math.atan2(pushY, pushX);
                    bug.speed = cfg.ladybugSpeed;
                    this.spawnRipple(bug.x, bug.y, '#6b7280');
                    break;
                }
            }
        }

        const table = cfg.table;
        if (table) {
            const floorY = V_HEIGHT - 22;
            const tableBottomY = table.legBottomY || floorY - 5;
            const legTopY = table.y + table.topHeight - 2;
            const legSpan = 25;
            const pairCenters = [table.x + 48, table.x + table.width - 48];
            const tableParts = [
                { type: 'rect', x: table.x, y: table.y, width: table.width, height: table.topHeight },
                ...pairCenters.flatMap(centerX => [
                    { type: 'segment', x1: centerX - legSpan, y1: legTopY, x2: centerX + legSpan, y2: tableBottomY, thickness: 8 },
                    { type: 'segment', x1: centerX + legSpan, y1: legTopY, x2: centerX - legSpan, y2: tableBottomY, thickness: 8 }
                ])
            ];

            const resolveTablePart = part => {
                let normalX;
                let normalY;
                let overlap;
                let alreadyEjected = false;

                if (part.type === 'rect') {
                    const nearestX = Math.max(part.x, Math.min(bug.x, part.x + part.width));
                    const nearestY = Math.max(part.y, Math.min(bug.y, part.y + part.height));
                    const pushX = bug.x - nearestX;
                    const pushY = bug.y - nearestY;
                    const distance = Math.hypot(pushX, pushY);
                    overlap = bug.radius - distance + 0.5;
                    if (overlap <= 0) return false;

                    if (distance > 0.001) {
                        normalX = pushX / distance;
                        normalY = pushY / distance;
                    } else {
                        const distances = [
                            { side: 'left', value: Math.abs(bug.x - part.x) },
                            { side: 'right', value: Math.abs(part.x + part.width - bug.x) },
                            { side: 'top', value: Math.abs(bug.y - part.y) },
                            { side: 'bottom', value: Math.abs(part.y + part.height - bug.y) }
                        ];
                        const nearestSide = distances.sort((a, b) => a.value - b.value)[0].side;
                        if (nearestSide === 'left') {
                            bug.x = part.x - bug.radius - 0.5;
                            normalX = -1;
                            normalY = 0;
                        } else if (nearestSide === 'right') {
                            bug.x = part.x + part.width + bug.radius + 0.5;
                            normalX = 1;
                            normalY = 0;
                        } else if (nearestSide === 'top') {
                            bug.y = part.y - bug.radius - 0.5;
                            normalX = 0;
                            normalY = -1;
                        } else {
                            bug.y = part.y + part.height + bug.radius + 0.5;
                            normalX = 0;
                            normalY = 1;
                        }
                        alreadyEjected = true;
                    }
                } else {
                    const segmentX = part.x2 - part.x1;
                    const segmentY = part.y2 - part.y1;
                    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
                    const along = Math.max(0, Math.min(1, ((bug.x - part.x1) * segmentX + (bug.y - part.y1) * segmentY) / segmentLengthSquared));
                    const nearestX = part.x1 + segmentX * along;
                    const nearestY = part.y1 + segmentY * along;
                    const pushX = bug.x - nearestX;
                    const pushY = bug.y - nearestY;
                    const distance = Math.hypot(pushX, pushY);
                    overlap = bug.radius + part.thickness / 2 - distance + 0.5;
                    if (overlap <= 0) return false;

                    if (distance > 0.001) {
                        normalX = pushX / distance;
                        normalY = pushY / distance;
                    } else {
                        const segmentLength = Math.sqrt(segmentLengthSquared);
                        normalX = -segmentY / segmentLength;
                        normalY = segmentX / segmentLength;
                    }
                }

                if (!alreadyEjected) {
                    bug.x += normalX * overlap;
                    bug.y += normalY * overlap;
                }
                bug.targetAngle = Math.atan2(normalY, normalX);
                bug.speed = cfg.ladybugSpeed;
                this.spawnRipple(bug.x, bug.y, '#b87945');
                return true;
            };

            for (const part of tableParts) {
                if (resolveTablePart(part)) break;
            }
        }

        // 4. Update Spiders & Patrol
        let closestSpiderDist = 9999;
        this.spiders.forEach(sp => {
            // Patrol along ceiling
            if (sp.patrolSpeed !== 0) {
                sp.x += sp.patrolSpeed;
                if (sp.x < sp.patrolMinX || sp.x > sp.patrolMaxX) {
                    sp.patrolSpeed = -sp.patrolSpeed;
                }
            }

            // Occasional cellar spider hanging descent
            if (sp.maxHang > 0) {
                sp.hangTimer += dt;
                sp.y = sp.originY + Math.sin(sp.hangTimer * 0.8) * sp.maxHang * 0.5 + sp.maxHang * 0.5;
            }

            // Spider leg twitching jitter
            sp.legJitter = Math.sin(performance.now() * 0.008) * 4;

            // Distance to ladybug
            const d = Math.hypot(bug.x - sp.x, bug.y - sp.y);
            if (d < closestSpiderDist) closestSpiderDist = d;

            // Alert eye glow if close
            if (d < sp.webRadius * 1.1) {
                sp.eyeGlow = Math.min(1, sp.eyeGlow + dt * 2);
            } else {
                sp.eyeGlow = Math.max(0, sp.eyeGlow - dt * 2);
            }

            // Web collision check
            // Web is a zone around (sp.x, sp.y) + ceiling area (y < 95)
            const inWebRadius = d < sp.webRadius * 0.75;
            const inCeilingWebZone = bug.y < 85 && (bug.x > sp.x - sp.webRadius * 0.9 && bug.x < sp.x + sp.webRadius * 0.9);

            if (inWebRadius || inCeilingWebZone) {
                // Caught! Trigger Lose Sequence!
                this.triggerLose(sp);
            }
        });

        // Update threat meter in HUD
        const threatFill = document.getElementById('hud-threat-fill');
        if (threatFill) {
            const threatPercent = Math.max(0, Math.min(100, (1 - (closestSpiderDist - 120) / 350) * 100));
            threatFill.style.width = `${threatPercent}%`;
        }

        // 4. Check Safe Zone / Window Collision
        const inWindowX = bug.x > cfg.windowX - 20 && bug.x < cfg.windowX + cfg.windowW + 20;
        const inWindowY = bug.y > cfg.windowY && bug.y < cfg.windowY + cfg.windowH;

        if (inWindowX && inWindowY) {
            // Escaped to safety! Trigger Win Sequence!
            this.triggerWin();
        }
    }

    startCeilingCatch() {
        if (this.state !== STATE.PLAYING || this.ceilingCatch || !this.ladybug || this.spiders.length === 0) {
            return;
        }

        const bug = this.ladybug;
        const spider = this.spiders.reduce((closest, candidate) => {
            const candidateDistance = Math.hypot(bug.x - candidate.x, bug.y - candidate.y);
            const closestDistance = Math.hypot(bug.x - closest.x, bug.y - closest.y);
            return candidateDistance < closestDistance ? candidate : closest;
        });

        // Move the spider a little farther above the ceiling than the bug's
        // body so the chase visibly disappears from the play area.
        const hiddenX = bug.x;
        const hiddenY = Math.min(bug.y - 60, -110);

        bug.speed = 0;
        bug.targetAngle = -Math.PI / 2;
        this.ceilingCatch = {
            spider,
            phase: 'chase',
            hiddenX,
            hiddenY,
            returnX: bug.x,
            returnY: 105,
            speed: 230,
            returnSpeed: 155
        };
        this.state = STATE.CEILING_CATCH;
    }

    updateCeilingCatch(dt) {
        const catchSequence = this.ceilingCatch;
        const bug = this.ladybug;

        if (!catchSequence || !catchSequence.spider || !bug) {
            return;
        }

        const sp = catchSequence.spider;
        bug.legPhase += dt * 10;

        if (catchSequence.phase === 'chase') {
            const dx = catchSequence.hiddenX - sp.x;
            const dy = catchSequence.hiddenY - sp.y;
            const distance = Math.hypot(dx, dy);
            const step = catchSequence.speed * dt;

            if (distance <= step) {
                sp.x = catchSequence.hiddenX;
                sp.y = catchSequence.hiddenY;
                bug.x = catchSequence.hiddenX;
                bug.y = catchSequence.hiddenY;
                catchSequence.phase = 'return';
            } else {
                sp.x += (dx / distance) * step;
                sp.y += (dy / distance) * step;
                // Keep the ladybug off-screen while the spider catches up.
                bug.x = catchSequence.hiddenX;
                bug.y = catchSequence.hiddenY;
            }
            return;
        }

        // Bring both characters back as a single group. The ladybug hangs
        // just below the spider, making the off-screen catch clear visually.
        const dy = catchSequence.returnY - sp.y;
        const step = catchSequence.returnSpeed * dt;
        sp.x = catchSequence.returnX;
        sp.y += Math.min(step, Math.max(0, dy));
        bug.x = sp.x;
        bug.y = sp.y + 32;
        bug.angle = Math.PI / 2;

        if (sp.y >= catchSequence.returnY) {
            this.ceilingCatch = null;
            this.triggerLose(sp);
        }
    }

    triggerWin() {
        this.state = STATE.WIN_ANIMATION;
        this.animTimer = 0;
        this.ladybug.isSafe = true;
        this.ladybug.happySmile = true;

        // Use the same clear English "Woohoo!" voice in both language modes;
        // the on-screen speech bubble still follows the selected language.
        window.soundEngine.playWoohoo('en');

        // Speech bubble
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        this.speechBubble = {
            text: t.woohoo,
            timer: 0
        };

        // Confetti burst
        for (let i = 0; i < 45; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 5 + 2;
            this.particles.push({
                type: 'confetti',
                x: this.ladybug.x,
                y: this.ladybug.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 3,
                gravity: 0.15,
                radius: Math.random() * 4 + 3,
                color: ['#ffdd00', '#ff4d6d', '#48bb78', '#38bdf8', '#c084fc'][Math.floor(Math.random() * 5)],
                alpha: 1,
                decay: 0.015
            });
        }
    }

    updateWinAnimation(dt) {
        this.animTimer += dt;
        const bug = this.ladybug;

        // Open wings
        bug.wingOpen = Math.min(1, bug.wingOpen + dt * 4);
        bug.wingFlap += dt * 45; // rapid flutter

        // Ladybug swoops upwards and out of window into the sunny garden!
        bug.x -= dt * 90;
        bug.y -= dt * 110;
        bug.angle = -Math.PI * 0.7; // Aiming out the window

        if (this.speechBubble) {
            this.speechBubble.timer += dt;
        }

        // After 2.5 seconds, show Win Modal
        if (this.animTimer > 2.2) {
            this.state = STATE.LEVEL_WON;
            if (this.currentLevelIndex + 1 > this.unlockedLevels) {
                this.unlockedLevels = Math.min(LEVELS.length, this.currentLevelIndex + 2);
            }

            const winModal = document.getElementById('win-modal');
            const winMsg = document.getElementById('win-msg');
            const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
            this.progress.unlockedLevels = this.unlockedLevels;
            this.saveProgress();

            if (this.currentLevelIndex + 1 < LEVELS.length) {
                winMsg.textContent = t.winMsgDefault;
                document.getElementById('btn-next-level').textContent = t.nextLevel;
            } else {
                winMsg.textContent = t.winMsgFinal;
                document.getElementById('btn-next-level').textContent = t.viewEpilogueBtn;
            }

            winModal.classList.remove('hidden');
        }
    }

    triggerLose(spider) {
        this.state = STATE.LOSE_ANIMATION;
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        this.animTimer = 0;
        this.attackSpider = spider;
        spider.attacking = true;
        this.ladybug.isDead = true;
        this.ladybug.crying = true;

        // Play doomed weeping Georgian 'ა' vocalization ("აააა!")
        window.soundEngine.playLadybugCry(this.settings.language);

        // Speech bubble with scream
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        this.speechBubble = {
            text: t.scream || "ააა! 😭",
            timer: 0
        };
    }

    updateLoseAnimation(dt) {
        this.animTimer += dt;
        const bug = this.ladybug;
        const sp = this.attackSpider;

        if (this.speechBubble) {
            this.speechBubble.timer += dt;
        }

        bug.tearPhase += dt * 10;

        // Spider lunges down rapidly along silk to snatch ladybug
        if (sp) {
            const dx = bug.x - sp.x;
            const dy = bug.y - sp.y;
            sp.x += dx * 0.12;
            sp.y += dy * 0.12;
        }

        // Animated tear drops falling from ladybug
        if (Math.random() < 0.35) {
            this.particles.push({
                type: 'dust',
                x: bug.x + (Math.random() - 0.5) * 10,
                y: bug.y + 4,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 2 + 1.5,
                radius: 2.2,
                color: '#60a5fa',
                alpha: 0.9,
                decay: 0.03
            });
        }

        // Show Lose Modal after 2.2 seconds
        if (this.animTimer > 2.4) {
            this.state = STATE.GAME_OVER;
            const loseModal = document.getElementById('lose-modal');
            const loseMsg = document.getElementById('lose-msg');
            const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
            loseMsg.textContent = t.loseMsg;
            loseModal.classList.remove('hidden');
        }
    }

    // DRAWING SYSTEM
    draw() {
        ctx.save();
        ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

        // Screen shake when spider strikes / attacks
        if (this.screenShake > 0) {
            const mag = this.screenShake * 16;
            const sx = (Math.random() - 0.5) * mag;
            const sy = (Math.random() - 0.5) * mag;
            ctx.translate(sx, sy);
        }

        // 1. Draw Wall Background & Ceiling Molding
        this.drawWall();

        // 2. Draw Sunlit Window (Safe Zone)
        this.drawWindow();

        // 3. Draw level-specific furniture obstacles
        this.drawCabinet();
        this.drawTable();
        this.drawFan();

        // 4. Draw Spider Web(s)
        this.drawWebs();

        // 5. Draw Barriers
        this.drawBarriers();

        // 6. Draw Ladybug
        if (this.ladybug) {
            this.drawLadybug(this.ladybug);
        }

        // 7. Draw Spiders (Pholcidae / Cellar Spider)
        this.spiders.forEach(sp => this.drawCellarSpider(sp));

        // 8. Draw Ambient Dust & Particles
        this.drawParticles();

        // 9. Draw Speech Bubble if active
        if (this.speechBubble && this.ladybug) {
            this.drawSpeechBubble(this.ladybug.x, this.ladybug.y - 35, this.speechBubble.text);
        }

        ctx.restore();
    }

    drawWall() {
        // Wall texture with subtle lighting
        const grad = ctx.createLinearGradient(0, 0, V_WIDTH, V_HEIGHT);
        grad.addColorStop(0, '#f0ece1');
        grad.addColorStop(0.5, '#e4ded2');
        grad.addColorStop(1, '#d5cec0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        // Subtle wallpaper line stripes
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.025)';
        ctx.lineWidth = 1;
        for (let x = 0; x < V_WIDTH; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, V_HEIGHT);
            ctx.stroke();
        }

        // Ceiling molding at top
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, V_WIDTH, 18);
        ctx.fillStyle = '#eaeaea';
        ctx.fillRect(0, 18, V_WIDTH, 6);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(0, 24, V_WIDTH, 8); // shadow under ceiling

        // Baseboard at bottom
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(0, V_HEIGHT - 22, V_WIDTH, 22);
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0, V_HEIGHT - 22, V_WIDTH, 5);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, V_HEIGHT - 2, V_WIDTH, 2);
    }

    drawWindow() {
        const cfg = LEVELS[this.currentLevelIndex];
        const wx = cfg.windowX;
        const wy = cfg.windowY;
        const ww = cfg.windowW;
        const wh = cfg.windowH;

        ctx.save();

        // Window Frame shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(wx, wy - 4, ww + 10, wh + 8);

        // Outside sky & sunlight
        const skyGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        skyGrad.addColorStop(0, '#70d6ff');
        skyGrad.addColorStop(0.6, '#9bf6ff');
        skyGrad.addColorStop(1, '#caffbf');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(wx, wy, ww, wh);

        // Green leaves outside peeking in
        ctx.fillStyle = '#38b000';
        ctx.beginPath();
        ctx.ellipse(wx + 25, wy + 40, 22, 10, 0.3, 0, Math.PI * 2);
        ctx.ellipse(wx + 45, wy + 70, 26, 12, -0.4, 0, Math.PI * 2);
        ctx.ellipse(wx + 20, wy + wh - 40, 30, 14, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Window Frame (White wood)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(wx, wy, ww, wh);

        // Window Sill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx, wy + wh - 8, ww + 15, 14);
        ctx.fillStyle = '#dcdcdc';
        ctx.fillRect(wx, wy + wh + 6, ww + 15, 4);

        // God-rays (Sunbeams pouring into the room)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(wx + ww, wy);
        ctx.lineTo(wx + ww + 380, wy + 180);
        ctx.lineTo(wx + ww + 240, wy + wh + 120);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.closePath();
        const sunbeamGrad = ctx.createLinearGradient(wx, wy, wx + 400, wy + 300);
        sunbeamGrad.addColorStop(0, 'rgba(255, 243, 176, 0.35)');
        sunbeamGrad.addColorStop(0.7, 'rgba(255, 243, 176, 0.12)');
        sunbeamGrad.addColorStop(1, 'rgba(255, 243, 176, 0)');
        ctx.fillStyle = sunbeamGrad;
        ctx.fill();
        ctx.restore();

        // Safe Exit Sign text
        const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ka;
        ctx.fillStyle = '#1b4332';
        ctx.font = 'bold 12px "Noto Sans Georgian", sans-serif';
        ctx.fillText(t.freedomSign, wx + 12, wy + 24);

        ctx.restore();
    }

    drawCabinet() {
        const cabinet = LEVELS[this.currentLevelIndex].cabinet;
        if (!cabinet) return;

        const { x, y, width, height } = cabinet;
        ctx.save();

        const floorY = V_HEIGHT - 22;

        // Floor shadow and warm wooden body. The cabinet reaches the floor,
        // so the window is visibly blocked by a full-height piece of furniture.
        ctx.fillStyle = 'rgba(45, 28, 18, 0.22)';
        ctx.fillRect(x + 10, y + 10, width + 8, Math.min(height + 8, floorY - y + 4));
        const wood = ctx.createLinearGradient(x, y, x + width, y + height);
        wood.addColorStop(0, '#9a6338');
        wood.addColorStop(0.5, '#7a4729');
        wood.addColorStop(1, '#55301f');
        ctx.fillStyle = wood;
        ctx.fillRect(x, y, width, height);

        // Thick top edge makes the blocked route readable at a glance.
        ctx.fillStyle = '#c4874d';
        ctx.fillRect(x, y, width, 14);
        ctx.fillStyle = '#4b2a1b';
        ctx.fillRect(x, y + 14, width, 5);

        // One cabinet door and a single simple handle.
        ctx.fillStyle = 'rgba(208, 145, 83, 0.35)';
        ctx.fillRect(x + 8, y + 28, width - 16, height - 42);
        ctx.strokeStyle = 'rgba(55, 29, 18, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 8, y + 28, width - 16, height - 42);

        ctx.fillStyle = '#e0ad67';
        ctx.beginPath();
        ctx.arc(x + width - 22, y + height / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Feet and a subtle highlight keep the object integrated with the room.
        ctx.fillStyle = '#3c2419';
        ctx.fillRect(x + 12, floorY - 8, 16, 8);
        ctx.fillRect(x + width - 28, floorY - 8, 16, 8);
        ctx.strokeStyle = 'rgba(255, 220, 160, 0.28)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);

        ctx.restore();
    }

    drawTable() {
        const table = LEVELS[this.currentLevelIndex].table;
        if (!table) return;

        const floorY = V_HEIGHT - 22;
        const tableBottomY = table.legBottomY || floorY - 5;
        const legTopY = table.y + table.topHeight - 2;
        const legSpan = 25;
        const pairCenters = [table.x + 48, table.x + table.width - 48];

        ctx.save();

        // Soft floor shadow anchors the folding table to the wall and floor.
        ctx.fillStyle = 'rgba(45, 35, 28, 0.20)';
        ctx.beginPath();
        ctx.ellipse(table.x + table.width / 2, floorY - 1, table.width * 0.46, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Each side is a crossed pair of gray metal legs.
        ctx.lineCap = 'round';
        ctx.lineWidth = 9;
        ctx.strokeStyle = '#68717c';
        pairCenters.forEach(centerX => {
            ctx.beginPath();
            ctx.moveTo(centerX - legSpan, legTopY);
            ctx.lineTo(centerX + legSpan, tableBottomY);
            ctx.moveTo(centerX + legSpan, legTopY);
            ctx.lineTo(centerX - legSpan, tableBottomY);
            ctx.stroke();

            // A narrow highlight gives the folded metal tubes a rounded edge.
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(220, 226, 232, 0.48)';
            ctx.beginPath();
            ctx.moveTo(centerX - legSpan, legTopY);
            ctx.lineTo(centerX + legSpan, tableBottomY);
            ctx.moveTo(centerX + legSpan, legTopY);
            ctx.lineTo(centerX - legSpan, tableBottomY);
            ctx.stroke();
            ctx.lineWidth = 9;
            ctx.strokeStyle = '#68717c';
        });

        // Light plastic caps protect each of the four metal feet.
        ctx.fillStyle = '#c7cdd3';
        ctx.strokeStyle = '#5d6670';
        ctx.lineWidth = 1.5;
        pairCenters.forEach(centerX => {
            [centerX - legSpan, centerX + legSpan].forEach(footX => {
                ctx.beginPath();
                ctx.ellipse(footX, tableBottomY, 11, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        });

        // Warm light-brown plastic tabletop, with a darker molded front edge.
        ctx.fillStyle = '#9b6037';
        ctx.fillRect(table.x, table.y + 7, table.width, table.topHeight - 5);
        const topPlastic = ctx.createLinearGradient(table.x, table.y, table.x, table.y + table.topHeight);
        topPlastic.addColorStop(0, '#e0aa72');
        topPlastic.addColorStop(0.55, '#c88b54');
        topPlastic.addColorStop(1, '#b87543');
        ctx.fillStyle = topPlastic;
        ctx.fillRect(table.x, table.y, table.width, table.topHeight - 4);
        ctx.fillStyle = 'rgba(255, 231, 196, 0.45)';
        ctx.fillRect(table.x + 5, table.y + 3, table.width - 10, 3);
        ctx.strokeStyle = '#704329';
        ctx.lineWidth = 2;
        ctx.strokeRect(table.x + 1, table.y + 1, table.width - 2, table.topHeight - 2);

        // Small hinges emphasize that the legs can fold underneath the top.
        ctx.fillStyle = '#535c66';
        pairCenters.forEach(centerX => {
            [centerX - legSpan, centerX + legSpan].forEach(hingeX => {
                ctx.beginPath();
                ctx.arc(hingeX, legTopY, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        ctx.restore();
    }

    drawFan() {
        const fan = LEVELS[this.currentLevelIndex].fan;
        if (!fan) return;

        const { x, y, width } = fan;
        const floorY = V_HEIGHT - 22;
        const centerX = x + width / 2;
        const headRadius = Math.min(width * 0.4, 36);
        const headY = y + headRadius + 12;

        ctx.save();

        // Stand and floor base.
        ctx.fillStyle = 'rgba(107, 114, 128, 0.82)';
        ctx.fillRect(centerX - 5, headY + headRadius - 2, 10, floorY - headY - headRadius + 2);
        ctx.fillStyle = 'rgba(75, 85, 99, 0.86)';
        ctx.beginPath();
        ctx.ellipse(centerX, floorY - 5, width * 0.38, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotating fan blades inside a protective cage.
        ctx.save();
        ctx.translate(centerX, headY);
        // Transparent gray housing: the wall remains visible behind it.
        ctx.fillStyle = 'rgba(156, 163, 175, 0.16)';
        ctx.beginPath();
        ctx.arc(0, 0, headRadius + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(performance.now() * 0.004);
        ctx.fillStyle = 'rgba(209, 213, 219, 0.70)';
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(headRadius * 0.38, 0, headRadius * 0.55, headRadius * 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(107, 114, 128, 0.90)';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Gray protective mesh around the spinning propeller.
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.90)';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, headY);
            ctx.lineTo(centerX + Math.cos(angle) * (headRadius + 5), headY + Math.sin(angle) * (headRadius + 5));
            ctx.stroke();
        }

        ctx.restore();
    }

    drawWebs() {
        const cfg = LEVELS[this.currentLevelIndex];
        ctx.save();
        ctx.strokeStyle = 'rgba(230, 230, 230, 0.65)';
        ctx.lineWidth = 1.2;

        // Custom level web strands
        if (cfg.webStrands) {
            cfg.webStrands.forEach(st => {
                ctx.beginPath();
                ctx.moveTo(st.x1, st.y1);
                // Slight curved sag in silk thread
                const midX = (st.x1 + st.x2) / 2;
                const midY = (st.y1 + st.y2) / 2 + 10;
                ctx.quadraticCurveTo(midX, midY, st.x2, st.y2);
                ctx.stroke();
            });
        }

        // Cellar Spider characteristic tangled cobweb around each spider
        this.spiders.forEach(sp => {
            const count = 18;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI + (i % 2 === 0 ? 0.1 : -0.1);
                const r = sp.webRadius * (0.4 + 0.6 * ((i * 3) % 5) / 5);
                const endX = sp.x + Math.cos(angle) * r;
                const endY = sp.y + Math.sin(angle) * r * 0.7;

                ctx.strokeStyle = 'rgba(240, 240, 240, 0.4)';
                ctx.beginPath();
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Tangled cross-threads
                if (i % 3 === 0) {
                    const prevAngle = ((i - 1) / count) * Math.PI;
                    const prevX = sp.x + Math.cos(prevAngle) * r * 0.8;
                    const prevY = sp.y + Math.sin(prevAngle) * r * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(prevX, prevY);
                    ctx.stroke();
                }
            }
        });

        ctx.restore();
    }

    drawBarriers() {
        this.barriers.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.globalAlpha = b.opacity;

            // Draw a fresh green leaf as the barrier
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Leaf base
            ctx.fillStyle = '#2d6a4f';
            ctx.beginPath();
            ctx.ellipse(0, 0, b.length / 2, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Leaf highlight
            ctx.fillStyle = '#52b788';
            ctx.beginPath();
            ctx.ellipse(-2, -3, b.length / 2 - 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Leaf vein
            ctx.strokeStyle = '#1b4332';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-b.length / 2 + 5, 0);
            ctx.lineTo(b.length / 2 - 5, 0);
            ctx.stroke();

            // Pulsing defensive shield ring
            ctx.strokeStyle = 'rgba(82, 183, 136, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        });
    }

    drawLadybug(bug) {
        ctx.save();
        ctx.translate(bug.x, bug.y);
        ctx.rotate(bug.angle + Math.PI / 2); // default art points UP

        // Soft drop shadow on wall
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // 1. Legs (6 jointed black legs with crawling animation)
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        const legOffsets = [-8, 0, 8];
        legOffsets.forEach((offY, idx) => {
            const sideWiggle = Math.sin(bug.legPhase + idx * 1.6) * 6;

            // Left leg
            ctx.beginPath();
            ctx.moveTo(-10, offY);
            ctx.lineTo(-20, offY - 4 + sideWiggle);
            ctx.lineTo(-26, offY + 4 + sideWiggle);
            ctx.stroke();

            // Right leg
            ctx.beginPath();
            ctx.moveTo(10, offY);
            ctx.lineTo(20, offY - 4 - sideWiggle);
            ctx.lineTo(26, offY + 4 - sideWiggle);
            ctx.stroke();
        });

        // 2. Antennae
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-4, -18);
        ctx.quadraticCurveTo(-10, -28, -8, -32);
        ctx.moveTo(4, -18);
        ctx.quadraticCurveTo(10, -28, 8, -32);
        ctx.stroke();

        // 3. Head & Pronotum
        // Head
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(0, -16, 7, 0, Math.PI * 2);
        ctx.fill();

        // White spots on head (distinctive coccinellidae markings)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -18, 1.8, 0, Math.PI * 2);
        ctx.arc(4, -18, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Pronotum (black plate behind head)
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(0, -11, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // White patches on pronotum
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-8, -12, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.ellipse(8, -12, 3, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 4. Transparent Fluttering Wings (if Win animation)
        if (bug.wingOpen > 0) {
            ctx.save();
            const flap = Math.sin(bug.wingFlap) * 0.4;
            ctx.fillStyle = 'rgba(230, 245, 255, 0.65)';
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.85)';
            ctx.lineWidth = 1;

            // Left translucent flight wing
            ctx.save();
            ctx.rotate(-0.4 - flap);
            ctx.beginPath();
            ctx.ellipse(-16, 12, 10, 28, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Right translucent flight wing
            ctx.save();
            ctx.rotate(0.4 + flap);
            ctx.beginPath();
            ctx.ellipse(16, 12, 10, 28, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }

        // 5. Elytra (Red Wing Covers) with 7 Black Spots
        ctx.save();
        const split = bug.wingOpen * 0.7; // Spread angle when flying

        // Left Elytron
        ctx.save();
        ctx.rotate(-split);
        this.drawElytronHalf(true);
        ctx.restore();

        // Right Elytron
        ctx.save();
        ctx.rotate(split);
        this.drawElytronHalf(false);
        ctx.restore();

        ctx.restore();

        // 6. Facial Expressions (Happy Smile or Crying Tears)
        if (bug.happySmile) {
            // Big happy eyes with sparkles
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-4, -17, 3, 0, Math.PI * 2);
            ctx.arc(4, -17, 3, 0, Math.PI * 2);
            ctx.fill();

            // Eye sparkles
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5, -18, 1.2, 0, Math.PI * 2);
            ctx.arc(3, -18, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Cute smiling mouth!
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -14, 4.5, 0.2, Math.PI - 0.2, false);
            ctx.stroke();

            // Rosy cheeks
            ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
            ctx.beginPath();
            ctx.arc(-8, -14, 2.5, 0, Math.PI * 2);
            ctx.arc(8, -14, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (bug.crying) {
            // Sad wailing eyes
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(-4, -16, 3, Math.PI * 0.8, Math.PI * 2.2, false);
            ctx.arc(4, -16, 3, Math.PI * 0.8, Math.PI * 2.2, false);
            ctx.stroke();

            // Sad open crying mouth
            ctx.fillStyle = '#222222';
            ctx.beginPath();
            ctx.ellipse(0, -13, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Flowing tears
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(-6, -12, 2.5, 0, Math.PI * 2);
            ctx.arc(6, -12, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawElytronHalf(isLeft) {
        const sign = isLeft ? -1 : 1;
        const pal = LADYBUG_PALETTES[this.settings.ladybugColor] || LADYBUG_PALETTES.red;

        // Glossy colored carapace using chosen palette
        const colorGrad = ctx.createRadialGradient(sign * 6, -2, 2, sign * 6, 4, 18);
        colorGrad.addColorStop(0, pal.light);
        colorGrad.addColorStop(0.65, pal.base);
        colorGrad.addColorStop(1, pal.dark);
        ctx.fillStyle = colorGrad;

        ctx.beginPath();
        if (isLeft) {
            ctx.arc(0, 4, 16, -Math.PI / 2, Math.PI / 2, true);
        } else {
            ctx.arc(0, 4, 16, -Math.PI / 2, Math.PI / 2, false);
        }
        ctx.closePath();
        ctx.fill();

        // Center seam shadow
        ctx.strokeStyle = '#2b0000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, 20);
        ctx.stroke();

        // Black spots (characteristic 7 spots)
        ctx.fillStyle = '#111111';

        // Upper spot
        ctx.beginPath();
        ctx.arc(sign * 7, -3, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Mid-outer spot
        ctx.beginPath();
        ctx.arc(sign * 11, 6, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Lower spot
        ctx.beginPath();
        ctx.arc(sign * 6, 12, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Common spot near pronotum
        ctx.beginPath();
        ctx.arc(0, -9, 2.5, isLeft ? Math.PI / 2 : -Math.PI / 2, isLeft ? Math.PI * 1.5 : Math.PI / 2, false);
        ctx.fill();

        // Gloss highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(sign * 5, -2, 3, 6, sign * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCellarSpider(sp) {
        const pal = SPIDER_PALETTES[this.settings.spiderColor] || SPIDER_PALETTES.classic;
        ctx.save();
        ctx.translate(sp.x, sp.y);

        // Silk thread hanging from ceiling. Hide it while the spider is
        // above the viewport during the ceiling-catch transition.
        if (sp.y >= 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -sp.y + 18);
            ctx.stroke();
        }

        // Characteristic Pholcidae (Cellar Spider) Anatomy:
        // Extremely long, spindly, jointed translucent legs (8 legs)
        const jitter = sp.legJitter;
        const legAngles = [
            // Left legs (spread out widely)
            { l1: -2.2, l2: -2.8, len1: 42, len2: 50 },
            { l1: -1.8, l2: -2.3, len1: 48, len2: 55 },
            { l1: -1.3, l2: -1.7, len1: 45, len2: 52 },
            { l1: -0.7, l2: -1.0, len1: 38, len2: 44 },
            // Right legs
            { l1: -0.9, l2: -0.3, len1: 42, len2: 50 },
            { l1: -1.3, l2: -0.8, len1: 48, len2: 55 },
            { l1: -1.8, l2: -1.4, len1: 45, len2: 52 },
            { l1: -2.4, l2: -2.1, len1: 38, len2: 44 }
        ];

        ctx.strokeStyle = pal.leg;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';

        legAngles.forEach((la, idx) => {
            const legWobble = (idx % 2 === 0 ? jitter : -jitter) * 0.05;
            const jointX = Math.cos(la.l1 + legWobble) * la.len1;
            const jointY = Math.sin(la.l1 + legWobble) * la.len1;

            const tipX = jointX + Math.cos(la.l2 + legWobble) * la.len2;
            const tipY = jointY + Math.sin(la.l2 + legWobble) * la.len2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(jointX, jointY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Tiny joint bead
            ctx.fillStyle = pal.detail;
            ctx.beginPath();
            ctx.arc(jointX, jointY, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Cephalothorax (small front body)
        ctx.fillStyle = pal.head;
        ctx.beginPath();
        ctx.ellipse(0, -3, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Abdomen (elongated oval typical of cellar spider)
        ctx.fillStyle = pal.body;
        ctx.beginPath();
        ctx.ellipse(0, 8, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle abdomen pattern
        ctx.fillStyle = pal.detail;
        ctx.beginPath();
        ctx.arc(0, 6, 2, 0, Math.PI * 2);
        ctx.arc(0, 11, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes with dangerous glow
        const glow = sp.eyeGlow;
        ctx.fillStyle = pal.eye;
        ctx.shadowColor = pal.eye;
        ctx.shadowBlur = glow * 14;

        ctx.beginPath();
        ctx.arc(-2, -5, 1.4 + glow * 0.5, 0, Math.PI * 2);
        ctx.arc(2, -5, 1.4 + glow * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawParticles() {
        // Ambient dust
        ctx.save();
        this.dustParticles.forEach(dp => {
            ctx.fillStyle = `rgba(255, 240, 200, ${dp.alpha})`;
            ctx.beginPath();
            ctx.arc(dp.x, dp.y, dp.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Dynamic effects
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            if (p.type === 'ripple') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.type === 'dust' || p.type === 'confetti') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        ctx.restore();
    }

    drawSpeechBubble(x, y, text) {
        ctx.save();
        ctx.font = 'bold 15px "Noto Sans Georgian", sans-serif';
        const textWidth = ctx.measureText(text).width;
        const padX = 14;
        const padY = 8;
        const bubbleW = textWidth + padX * 2;
        const bubbleH = 32;
        const bx = Math.min(Math.max(x - bubbleW / 2, 10), V_WIDTH - bubbleW - 10);
        const by = y - bubbleH;

        // Balloon body
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bubbleW, bubbleH, 12);
        } else {
            ctx.rect(bx, by, bubbleW, bubbleH);
        }
        ctx.fill();

        // Balloon pointer
        ctx.beginPath();
        ctx.moveTo(x - 5, by + bubbleH);
        ctx.lineTo(x, by + bubbleH + 7);
        ctx.lineTo(x + 5, by + bubbleH);
        ctx.fill();

        // Text
        ctx.fillStyle = '#e63946';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx + bubbleW / 2, by + bubbleH / 2);

        ctx.restore();
    }
}

// Instantiate Game on load
window.addEventListener('load', () => {
    window.game = new Game();
});
