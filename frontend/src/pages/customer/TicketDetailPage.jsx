import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, Clock, X, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/support/tickets/${id}`);
      setTicket(response.data.data);
    } catch (error) {
      toast.error('Failed to load ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/support/tickets/${id}/messages`,
        { message: message.trim() }
      );

      if (response.data.success) {
        setTicket(response.data.data);
        setMessage('');
        toast.success('Message sent');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return;

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/support/tickets/${id}/close`
      );

      if (response.data.success) {
        toast.success('Ticket closed');
        setTicket(response.data.data);
        setShowRating(true);
      }
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const handleRateTicket = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/support/tickets/${id}/rate`,
        { rating }
      );

      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setShowRating(false);
        fetchTicket();
      }
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Ticket not found</p>
            <button
              onClick={() => navigate('/help')}
              className="btn btn-primary mt-4"
            >
              Back to Help Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/help')}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Help Center</span>
          </button>

          {/* Ticket Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">#{ticket.ticketNumber}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl text-gray-900 mb-2">{ticket.subject}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {ticket.status !== 'closed' && (
                <button
                  onClick={handleCloseTicket}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close Ticket
                </button>
              )}
            </div>

            {ticket.resolution?.customerSatisfaction && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Your Rating:</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= ticket.resolution.customerSatisfaction
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Conversation</h3>

            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {ticket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.senderRole === 'customer'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } rounded-2xl p-4`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {msg.senderRole === 'admin' ? 'Support Team' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{msg.message}</p>
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSendMessage}>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
                    disabled={sending}
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
              <button
                onClick={() => setShowRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              How satisfied are you with the support you received?
            </p>

            <div className="flex justify-center space-x-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRateTicket}
                disabled={rating === 0}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50"
              >
                Submit Rating
              </button>
              <button
                onClick={() => setShowRating(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
