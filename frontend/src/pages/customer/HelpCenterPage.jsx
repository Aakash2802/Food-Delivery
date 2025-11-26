import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, MessageSquare, ShoppingBag, CreditCard, Truck,
  Star, User, Phone, Mail, Plus, Search, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/support/tickets`);
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/support/tickets`,
        formData
      );

      if (response.data.success) {
        toast.success('Support ticket created successfully');
        setShowCreateTicket(false);
        setFormData({
          category: '',
          subject: '',
          description: '',
          priority: 'medium'
        });
        fetchTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const categories = [
    { value: 'order_issue', label: 'Order Issue', icon: ShoppingBag, color: 'text-blue-600' },
    { value: 'payment_issue', label: 'Payment Issue', icon: CreditCard, color: 'text-green-600' },
    { value: 'delivery_issue', label: 'Delivery Issue', icon: Truck, color: 'text-orange-600' },
    { value: 'food_quality', label: 'Food Quality', icon: Star, color: 'text-yellow-600' },
    { value: 'missing_items', label: 'Missing Items', icon: ShoppingBag, color: 'text-red-600' },
    { value: 'refund_request', label: 'Refund Request', icon: CreditCard, color: 'text-purple-600' },
    { value: 'account_issue', label: 'Account Issue', icon: User, color: 'text-indigo-600' },
    { value: 'technical_issue', label: 'Technical Issue', icon: HelpCircle, color: 'text-gray-600' },
    { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-pink-600' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-gray-500' }
  ];

  const faqData = [
    {
      category: 'Orders',
      icon: ShoppingBag,
      questions: [
        { q: 'How do I track my order?', a: 'Go to Order Tracking page and enter your order number.' },
        { q: 'Can I cancel my order?', a: 'Yes, you can cancel within 5 minutes of placing the order.' },
        { q: 'How long does delivery take?', a: 'Delivery typically takes 30-45 minutes depending on your location.' }
      ]
    },
    {
      category: 'Payments',
      icon: CreditCard,
      questions: [
        { q: 'What payment methods are accepted?', a: 'We accept credit cards, debit cards, UPI, and cash on delivery.' },
        { q: 'Is my payment information secure?', a: 'Yes, all payments are processed through secure gateways.' },
        { q: 'How do refunds work?', a: 'Refunds are processed within 5-7 business days to your original payment method.' }
      ]
    },
    {
      category: 'Loyalty Program',
      icon: Star,
      questions: [
        { q: 'How do I earn loyalty coins?', a: 'Earn 5% cashback on orders above ₹100. Coins = 5% of order value.' },
        { q: 'How can I redeem coins?', a: 'Apply coins at checkout. 1 coin = ₹1 discount on your order.' },
        { q: 'Do coins expire?', a: 'Yes, coins expire after 1 year from the date of earning.' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
            <p className="text-gray-600 text-lg">Search our FAQs or create a support ticket</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={() => setShowCreateTicket(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Create Ticket</h3>
              <p className="text-sm opacity-90">Get personalized support</p>
            </button>

            <a
              href="tel:+911234567890"
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-red-600"
            >
              <Phone className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-bold text-lg mb-2 text-gray-900">Call Us</h3>
              <p className="text-sm text-gray-600">+91 123 456 7890</p>
            </a>

            <a
              href="mailto:support@fooddelivery.com"
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-red-600"
            >
              <Mail className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-bold text-lg mb-2 text-gray-900">Email Us</h3>
              <p className="text-sm text-gray-600">support@fooddelivery.com</p>
            </a>
          </div>

          {/* Create Ticket Modal */}
          {showCreateTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create Support Ticket</h2>
                  <button
                    onClick={() => setShowCreateTicket(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="Brief description of your issue"
                      required
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
                      rows="5"
                      placeholder="Provide detailed information about your issue..."
                      required
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all"
                    >
                      Submit Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTicket(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My Tickets */}
          {tickets.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Support Tickets</h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => navigate(`/support/ticket/${ticket._id}`)}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 hover:border-red-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-gray-900">#{ticket.ticketNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqData.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Icon className="w-6 h-6 text-red-600" />
                      <h3 className="text-xl font-bold text-gray-900">{section.category}</h3>
                    </div>
                    <div className="space-y-4">
                      {section.questions.map((faq, qIdx) => (
                        <details key={qIdx} className="group">
                          <summary className="cursor-pointer font-semibold text-gray-900 hover:text-red-600 transition-colors list-none flex justify-between items-center py-2">
                            <span>{faq.q}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                          </summary>
                          <p className="text-gray-600 mt-2 pl-4 border-l-2 border-red-200">
                            {faq.a}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
