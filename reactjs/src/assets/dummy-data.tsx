import { UploadIcon, VideoIcon, ZapIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <UploadIcon className="w-6 h-6" />,
        title: 'Design & Development',
        desc: 'High Quality Design and Scalable Development Focused on Performance and Usability'
    },
    {
        icon: <ZapIcon className="w-6 h-6" />,
        title: 'Instant Generation',
        desc: 'Optimized Models Deliver Output in Seconds with Great Functionality'
    },
    {
        icon: <VideoIcon className="w-6 h-6" />,
        title: 'Video Synthesis',
        desc: 'Bring Products Shots into Life with Short-form, Social-ready videos'
    }
];

export const plansData = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$10',
        desc: 'Try the Platform at No Cost.',
        credits: '25',
        features: [
            '25 Credits',
            'Standard Quality',
            'No Watermark',
            'Slower Generation Speed',
            'Email support'
        ]
    },
    {
        id: 'pro',
        name: 'pro',
        price: '$25',
        desc: 'Creators and Small Teams',
        credits: '80',
        features: [
            '80 Credits',
            'HD Quality',
            'No Watermark',
            'Video Genertaion',
            'Priority support'
        ],
        popular: true
    },
    {
        id: 'ultra',
        name: 'ultra',
        price: '$99',
        desc: 'Scale across agencies & teams',
        credits: '300',
        features: [
            '300 Credits',
            'FHD Quality',
            'No Watermark',
            'Fast Generation Speed',
            'Chat + Email support'
        ]
    }
];

export const faqData = [
  {
    question: 'What can I create with AI?',
    answer: 'You can generate high-quality images, short videos, social media content, marketing visuals, and creative designs using simple text prompts.'
  },
  {
    question: 'Do I need design or editing skills?',
    answer: 'No. Our AI tools are designed for everyone, allowing you to create professional content without any technical or design experience.'
  },
  {
    question: 'How long does content generation take?',
    answer: 'Most images are generated within seconds, while AI videos typically take a few minutes depending on complexity and duration.'
  },
  {
    question: 'Can I use the generated content commercially?',
    answer: 'Yes. Content generated on the platform can be used for business, marketing, social media, and commercial projects, subject to our terms of use.'
  },
  {
    question: 'What types of videos can I create?',
    answer: 'You can create promotional videos, social media reels, product showcases, explainer clips, and other short-form video content.'
  },
];

export const footerLinks = [
    {
        title: "Quick Link",
        links: [
            { name: "Home", url: "#" },
            { name: "Features", url: "#" },
            { name: "Pricing", url: "#" },
            { name: "FAQs", url: "#" }
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", url: "#" },
            { name: "Terms of Service", url: "#" }
        ]
    },
    {
        title: "Connect",
        links: [
            { name: "Twitter", url: "#" },
            { name: "LinkedIn", url: "https://www.linkedin.com/in/afzaalhassan/" },
            { name: "GitHub", url: "https://github.com/Afzaal162" }
        ]
    }
];