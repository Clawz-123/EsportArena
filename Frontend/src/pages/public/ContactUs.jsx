import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import { validationSchema } from '../utils/contactusValidation.js'

const ContactUs = () => {
    const contactInfo = [
        {
            icon: Mail,
            label: 'Email',
            value: 'support@esportsarena.np',
        },
        {
            icon: Phone,
            label: 'Phone',
            value: '+977 9800000000',
        },
        {
            icon: MapPin,
            label: 'Location',
            value: 'Kathmandu, Nepal',
        },
    ]

    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        console.log('Form values:', values)
        // TODO: Implement actual form submission to backend
        setTimeout(() => {
            alert('Message sent successfully!')
            resetForm()
            setSubmitting(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <Header />

            {/* Page Header */}
            <div className="pt-20 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-[28px] font-bold text-[#E5E7EB] mb-2">
                        Contact Us
                    </h1>
                    <p className="text-[14px] text-[#9CA3AF]">
                        Have questions or need support? We're here to help you with anything related to our platform.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Contact Information */}
                        <div className="lg:col-span-1 space-y-6">
                            {contactInfo.map((item, index) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={index}
                                        className="bg-[#111827] border border-[#1F2937] rounded-lg p-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[#1F2937] flex items-center justify-center shrink-0">
                                                <Icon className="w-5 h-5 text-[#3B82F6]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[12px] text-[#6B7280] mb-1">
                                                    {item.label}
                                                </p>
                                                <p className="text-[14px] text-[#E5E7EB] font-medium">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-8">
                                {/* Form Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center">
                                        <Send className="w-5 h-5 text-[#3B82F6]" />
                                    </div>
                                    <h2 className="text-[18px] font-semibold text-[#E5E7EB]">
                                        Send a Message
                                    </h2>
                                </div>

                                {/* Form */}
                                <Formik
                                    initialValues={{
                                        name: '',
                                        email: '',
                                        subject: '',
                                        message: '',
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ isSubmitting }) => (
                                        <Form className="space-y-6">
                                            {/* Row 1 - Name and Email */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Your Name */}
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block text-[14px] font-medium text-[#E5E7EB] mb-2"
                                                    >
                                                        Your Name
                                                    </label>
                                                    <Field
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        placeholder="John Doe"
                                                        className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                                                    />
                                                    <ErrorMessage
                                                        name="name"
                                                        component="p"
                                                        className="mt-1 text-[12px] text-red-500"
                                                    />
                                                </div>

                                                {/* Email Address */}
                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="block text-[14px] font-medium text-[#E5E7EB] mb-2"
                                                    >
                                                        Email Address
                                                    </label>
                                                    <Field
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        placeholder="john@example.com"
                                                        className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                                                    />
                                                    <ErrorMessage
                                                        name="email"
                                                        component="p"
                                                        className="mt-1 text-[12px] text-red-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2 - Subject */}
                                            <div>
                                                <label
                                                    htmlFor="subject"
                                                    className="block text-[14px] font-medium text-[#E5E7EB] mb-2"
                                                >
                                                    Subject
                                                </label>
                                                <Field
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    placeholder="How can we help you?"
                                                    className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                                                />
                                                <ErrorMessage
                                                    name="subject"
                                                    component="p"
                                                    className="mt-1 text-[12px] text-red-500"
                                                />
                                            </div>

                                            {/* Row 3 - Message */}
                                            <div>
                                                <label
                                                    htmlFor="message"
                                                    className="block text-[14px] font-medium text-[#E5E7EB] mb-2"
                                                >
                                                    Message
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    id="message"
                                                    name="message"
                                                    rows="6"
                                                    placeholder="Write your message here..."
                                                    className="w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                                                />
                                                <ErrorMessage
                                                    name="message"
                                                    component="p"
                                                    className="mt-1 text-[12px] text-red-500"
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1F2937] disabled:text-[#6B7280] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors text-[14px]"
                                            >
                                                <Send className="w-4 h-4" />
                                                {isSubmitting ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default ContactUs
