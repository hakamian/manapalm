import React from 'react';
import { LinkedInIcon, EnvelopeIcon } from './icons';

const teamMembers = [
    {
        name: 'دکتر علی رضایی',
        role: 'بنیان‌گذار و مدیرعامل',
        bio: 'متخصص توسعه پایدار با چشم‌اندازی برای توانمندسازی جوامع از طریق کسب‌وکارهای اجتماعی.',
        image: 'https://picsum.photos/seed/ceo-portrait/300/300',
        linkedin: '#',
        email: 'ali.rezaei@example.com',
    },
    {
        name: 'مهندس سارا محمدی',
        role: 'مدیر فنی و هوشمانا',
        bio: 'کارشناس ارشد هوشمانا و یادگیری ماشین، مسئول پیاده‌سازی ابزارهای نوآورانه هوشمانا.',
        image: 'https://picsum.photos/seed/cto-portrait/300/300',
        linkedin: '#',
        email: 'sara.mohammadi@example.com',
    },
    {
        name: 'مریم حسینی',
        role: 'مدیر بازاریابی و فروش',
        bio: 'استراتژیست بازاریابی با تمرکز بر برندینگ و رشد کسب‌وکارهای مبتنی بر ارزش.',
        image: 'https://picsum.photos/seed/cmo-portrait/300/300',
        linkedin: '#',
        email: 'maryam.hosseini@example.com',
    },
];

const TeamMemberCard: React.FC<typeof teamMembers[0]> = ({ name, role, bio, image, linkedin, email }) => (
    <div className="bg-gray-800 rounded-lg p-6 text-center shadow-lg transform transition-transform duration-300 hover:-translate-y-2 border border-gray-700">
        <img src={image} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-700 object-cover" />
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-green-400 font-semibold mb-3">{role}</p>
        <p className="text-gray-400 text-sm mb-4">{bio}</p>
        <div className="flex justify-center space-x-reverse space-x-4">
            <a href={`mailto:${email}`} className="text-gray-400 hover:text-white transition-colors" aria-label={`Email ${name}`}>
                <EnvelopeIcon />
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label={`LinkedIn profile of ${name}`}>
                <LinkedInIcon />
            </a>
        </div>
    </div>
);

const TeamView: React.FC = () => {
    return (
        <section className="bg-gray-900 text-white py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">همکاران ما در تیم نخلستان معنا</h2>
                    <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                        ما تیمی از افراد متخصص و پرشور هستیم که با یک هدف مشترک گرد هم آمده‌ایم: ایجاد تأثیر مثبت و پایدار.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map(member => (
                        <TeamMemberCard key={member.name} {...member} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default React.memo(TeamView);