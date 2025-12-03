
import { GoogleGenAI } from '@google/genai';

// تعریف ابزارهای قابل اجرا توسط مدیر هوشمند
const toolsDefinition = [
  {
    name: 'publish_announcement',
    description: 'انتشار یک پست یا اطلاعیه عمومی در کانون برای تعامل با کاربران',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'تیتر جذاب برای اطلاعیه' },
        content: { type: 'STRING', description: 'متن کامل و الهام‌بخش پیام' },
        priority: { type: 'STRING', enum: ['high', 'normal'], description: 'اولویت نمایش' }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'mass_grant_points',
    description: 'پاداش دهی به گروهی از کاربران برای افزایش انگیزه',
    parameters: {
      type: 'OBJECT',
      properties: {
        amount: { type: 'NUMBER', description: 'مقدار امتیاز برای هر نفر' },
        reason: { type: 'STRING', description: 'دلیل اهدا (که در نوتیفیکیشن نمایش داده می‌شود)' },
        target_segment: { type: 'STRING', enum: ['all', 'active', 'new'], description: 'کدام گروه کاربران دریافت کنند' }
      },
      required: ['amount', 'reason']
    }
  },
  {
    name: 'create_flash_campaign',
    description: 'ایجاد یک کمپین فروش فوری برای افزایش درآمد',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING', description: 'نام کمپین' },
        goal_amount: { type: 'NUMBER', description: 'هدف تعداد نخل' },
        discount_percent: { type: 'NUMBER', description: 'درصد تخفیف (اختیاری)' }
      },
      required: ['name', 'goal_amount']
    }
  },
  {
    name: 'update_site_navigation',
    description: 'اضافه کردن یک آیتم جدید به منوی اصلی سایت (هدر) برای برجسته کردن یک بخش.',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: { type: 'STRING', enum: ['نخلستان', 'سفر', 'آکادمی', 'جامعه'], description: 'دسته‌بندی منویی که آیتم به آن اضافه می‌شود' },
        title: { type: 'STRING', description: 'عنوان آیتم جدید منو' },
        description: { type: 'STRING', description: 'توضیح کوتاه زیر عنوان' },
        view_name: { type: 'STRING', description: 'نام صفحه مقصد (مثلا shop, courses, community-hub)' },
        icon_name: { type: 'STRING', enum: ['SparklesIcon', 'FireIcon', 'StarIcon', 'GiftIcon'], description: 'نام آیکون نمایشی' }
      },
      required: ['category', 'title', 'description']
    }
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // دریافت وضعیت واقعی سیستم از فرانت‌اند
  const { context } = req.body; 

  const systemContext = context || {
    activeUsers: 150,
    revenueToday: 0,
    lastActivity: '2 hours ago',
    sentiment: 'neutral',
    actionHistory: [] // Default empty history
  };

  const prompt = `
    You are the **Autonomous CEO** of "Nakhlestan Ma'na" (Grove of Meaning).
    Your Goal: Maximize social impact, user spiritual growth, and financial sustainability.
    
    **Current Reality:**
    ${JSON.stringify(systemContext, null, 2)}
    
    **IMPORTANT - MEMORY:**
    Your recent actions: ${JSON.stringify(systemContext.actionHistory || [])}.
    DO NOT repeat the exact same action if it was done recently.
    
    **Directives:**
    1. Analyze the situation. Is engagement low? Is revenue down?
    2. Decide on ONE high-impact strategic move right now.
    3. DO NOT just chat. **USE A TOOL** to execute your will.
    4. If engagement is low, create an inspiring announcement or grant points.
    5. If revenue is low, start a campaign OR add a new menu item to highlight a section.
    6. If everything looks good, you can choose to do nothing and wait.
    
    Respond in Persian logic, but use the tools provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      tools: [{ functionDeclarations: toolsDefinition }],
    });

    const functionCalls = response.functionCalls;
    const executionPlan = [];
    let analysis = response.text || "در حال پایش و تصمیم‌گیری...";

    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        executionPlan.push({
          action: call.name,
          params: call.args
        });
      }
    } 
    // If no tool called, it means the CEO decided to do nothing, which is valid.

    res.status(200).json({
      analysis: analysis,
      plan: executionPlan
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
