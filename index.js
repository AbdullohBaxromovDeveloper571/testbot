const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('7161352666:AAFWgph6hXLxiM_JEDsjoJ26l9wnHqi1P7Y'); // Bot tokenini o'zgartiring

const participants = {}; // Foydalanuvchilar ma'lumotlarini saqlash uchun obyekt

// Test ma'lumotlari
class Test {
    constructor() {
        this.questions = [];
    }
}

// Foydalanuvchi uchun testni boshlash
bot.command('start', (ctx) => {
    const userId = ctx.from.id;
    if (!participants[userId]) {
        participants[userId] = { test: new Test(), currentQuestion: 0, correctAnswers: 0, isFinished: false };
        ctx.reply('Testni boshlash uchun tugmani bosing.', Markup.inlineKeyboard([
            [Markup.button.callback('Yangi test yaratish', 'new_test')]
        ]));
    } else {
        ctx.reply('Siz allaqachon testni boshladingiz. Yangi test uchun tugmani bosing.', Markup.inlineKeyboard([
            [Markup.button.callback('Yangi test yaratish', 'new_test')]
        ]));
    }
});

// Yangi test yaratish
bot.action('new_test', (ctx) => {
    const userId = ctx.from.id;
    if (participants[userId]) {
        participants[userId].test = new Test();
        participants[userId].currentQuestion = 0;
        participants[userId].correctAnswers = 0;
        participants[userId].isFinished = false;
        ctx.reply('Yangi test yaratishga kirishildi! Savolni kiriting:');
        ctx.reply('Savol kiritilgandan keyin variantlarni kiriting (har birini alohida yuborib, "done" deb yozing).');
    } else {
        ctx.reply('Avval /start komandasini bajaring.');
    }
});

// Savol qo'shish
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const participant = participants[userId];

    if (participant && !participant.isFinished) {
        const text = ctx.message.text;

        if (text === 'done') {
            if (participant.test.questions.length >= 10) {
                ctx.reply('Test tugadi! Siz testni yakunladingiz. Natijalarni ko\'rsatish uchun tugmani bosing.', Markup.inlineKeyboard([
                    [Markup.button.callback('Natijalarni ko\'rish', 'results')]
                ]));
                participant.isFinished = true; // Testni tugatganini belgilang
            } else {
                ctx.reply('Kamida 10 ta savol kiritishingiz kerak.');
            }
        } else {
            // Agar savol bo'lsa, qo'shish
            if (participant.test.questions.length < 300) {
                const question = {
                    text: text,
                    variants: [],
                    correctVariant: null,
                };

                participant.test.questions.push(question);
                ctx.reply('Variantlar kiritish uchun kiriting (har birini alohida yuboring, "done" deb yozing):');

                // Variantlarni kiritish
                bot.on('text', (ctx) => {
                    const userId = ctx.from.id;
                    const participant = participants[userId];

                    if (participant && !participant.isFinished && participant.test.questions.length > 0) {
                        const currentQuestion = participant.test.questions[participant.test.questions.length - 1];

                        if (ctx.message.text === 'done') {
                            ctx.reply('Savolni tugatdingiz! Testni yakunlash uchun tugmani bosing.', Markup.inlineKeyboard([
                                [Markup.button.callback('Testni yakunlash', 'finish_test')]
                            ]));
                        } else if (currentQuestion.variants.length < 4) {
                            currentQuestion.variants.push(ctx.message.text);
                            ctx.reply(`Variant qo'shildi: "${ctx.message.text}". Hozirgi variantlar: ${currentQuestion.variants.join(', ')}`);
                        } else {
                            ctx.reply('Siz maksimal 4 ta variant qo\'shdingiz.');
                        }
                    }
                });
            } else {
                ctx.reply('Maksimal 300 ta savol qo\'shdingiz.');
            }
        }
    }
});

// Testni tugatish
bot.action('finish_test', (ctx) => {
    const userId = ctx.from.id;
    const participant = participants[userId];

    if (participant && !participant.isFinished) {
        ctx.reply('Test tugadi! Siz testni yakunladingiz. Natijalarni ko\'rsatish uchun tugmani bosing.', Markup.inlineKeyboard([
            [Markup.button.callback('Natijalarni ko\'rish', 'results')]
        ]));
        participant.isFinished = true; // Testni tugatganini belgilang
    }
});

// Natijalarni ko'rsatish
bot.action('results', (ctx) => {
    const userId = ctx.from.id;
    const participant = participants[userId];

    if (participant && participant.isFinished) {
        ctx.reply(`Natijangiz: ${participant.correctAnswers} ta to'g'ri javob. Test tugadi!`);
    } else {
        ctx.reply('Siz hali testni tugatmagansiz.');
    }
});

// Botni ishga tushirish
bot.launch();
console.log('Bot ishga tushdi!');
