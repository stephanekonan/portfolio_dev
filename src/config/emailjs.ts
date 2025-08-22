export const emailjsConfig = {
    serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
    templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
    publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
};

export interface EmailJSTemplateParams {
    user_name: string;
    user_email: string;
    subject: string;
    message: string;
}
