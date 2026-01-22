// client/src/components/CheckoutForm.tsx

'use client'

import { useState } from 'react'
// import { Product } from '@/src/types'
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  MessageSquare,
  ShoppingBag,
  Shield,
  Clock,
  CreditCard,
  Lock,
  ChevronRight
} from 'lucide-react'
import { Product } from '@/types/product.types'

interface CheckoutFormProps {
  product: Product
  selectedSize: string
  onClose: () => void
}

interface OrderData {
  fullName: string
  email: string
  address: string
  phoneNumber: string
  district: string
  product: {
    id: string
    title: string
    normalPrice: number
    offerPrice?: number
  }
  size: string
  notes?: string
}

export default function CheckoutForm({ product, selectedSize, onClose }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    district: '',
    email: '',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState<'summary' | 'details' | 'confirm'>('summary')

  // Get selected size details
  const selectedSizeData = product.sizes?.find(s => s.size === selectedSize)

  // Helper function to safely format prices
  const formatPrice = (price?: number): string => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0.00'
    }
    return price.toFixed(2)
  }

  const calculateTotal = () => {
    return product.offerPrice || product.normalPrice || 0
  }

  const validatePhoneNumber = (phone: string): { isValid: boolean; formatted: string } => {
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    let formatted = cleaned
    if (formatted.startsWith('0')) {
      formatted = '+88' + formatted.substring(1)
    }
    
    if (!formatted.startsWith('+') && formatted.length > 0) {
      formatted = '+88' + formatted
    }
    
    const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/
    const isValid = phoneRegex.test(formatted)
    
    return { isValid, formatted }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (formData.fullName.length > 100) {
      errors.fullName = 'Name cannot exceed 100 characters'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else {
      const { isValid } = validatePhoneNumber(formData.phoneNumber)
      if (!isValid) {
        errors.phoneNumber = 'Please enter a valid phone number'
      }
    }
    
    if (!formData.district.trim()) {
      errors.district = 'District is required'
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    } else if (formData.address.length > 500) {
      errors.address = 'Address cannot exceed 500 characters'
    }
    
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const { isValid, formatted } = validatePhoneNumber(formData.phoneNumber)
      if (!isValid) {
        setFormErrors({ phoneNumber: 'Please enter a valid phone number' })
        setIsSubmitting(false)
        return
      }

      const orderData: OrderData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        phoneNumber: formatted,
        district: formData.district.trim(),
        product: {
          id: product._id,
          title: product.title,
          normalPrice: product.normalPrice,
          offerPrice: product.offerPrice
        },
        size: selectedSize
      }

      if (formData.notes.trim()) {
        orderData.notes = formData.notes.trim()
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL
      
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      let result
      try {
        result = await response.json()
      } catch (error) {
        throw new Error('Invalid response from server')
      }

      if (response.ok && result.success) {
        setCurrentStep('confirm')
      } else {
        alert(`❌ Failed to place order: ${result.message || 'Something went wrong'}`)
      }
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(`❌ ${error.message || 'Failed to place order'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`flex flex-col items-center ${currentStep === 'summary' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'summary' ? 'bg-blue-100 text-blue-600' : 
            currentStep === 'details' || currentStep === 'confirm' ? 'bg-green-100 text-green-600' : 
            'bg-gray-100 text-gray-400'
          }`}>
            {currentStep === 'summary' ? '1' : <CheckCircle className="w-5 h-5" />}
          </div>
          <span className="text-sm font-medium">Order Summary</span>
        </div>
        
        <div className={`w-16 h-1 mx-4 ${currentStep === 'details' || currentStep === 'confirm' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
        
        <div className={`flex flex-col items-center ${currentStep === 'details' ? 'text-blue-600' : currentStep === 'confirm' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'details' ? 'bg-blue-100 text-blue-600' : 
            currentStep === 'confirm' ? 'bg-green-100 text-green-600' : 
            'bg-gray-100 text-gray-400'
          }`}>
            {currentStep === 'details' ? '2' : currentStep === 'confirm' ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Your Details</span>
        </div>
        
        <div className={`w-16 h-1 mx-4 ${currentStep === 'confirm' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
        
        <div className={`flex flex-col items-center ${currentStep === 'confirm' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            currentStep === 'confirm' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep === 'confirm' ? <CheckCircle className="w-5 h-5" /> : '3'}
          </div>
          <span className="text-sm font-medium">Confirmation</span>
        </div>
      </div>
    </div>
  )

  const renderOrderSummary = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-xl border-4 border-white shadow-lg"
            />
            <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
              selectedSizeData?.stock && selectedSizeData.stock > 10 ? 'bg-green-500' :
              selectedSizeData?.stock && selectedSizeData.stock > 0 ? 'bg-amber-500' :
              'bg-red-500'
            }`}>
              {selectedSizeData?.stock || 0} left
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Size: {selectedSize}
              </div>
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                SKU: {product.sku}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Order Summary
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Product Price</span>
            <span className="text-gray-900 font-medium">${formatPrice(product.normalPrice)}</span>
          </div>
          
          {product.offerPrice && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600 font-medium">
                -${formatPrice(product.normalPrice - (product.offerPrice || 0))}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <div>
                {product.offerPrice && (
                  <span className="text-gray-500 line-through text-sm mr-2">
                    ${formatPrice(product.normalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-blue-600">
                  ${formatPrice(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Secure Checkout
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Lock className="w-4 h-4 text-green-500" />
            <span>Your payment information is encrypted and secure</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Delivery within 3-5 business days</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Package className="w-4 h-4 text-purple-500" />
            <span>Easy returns within 7 days</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('details')}
        disabled={!selectedSizeData?.stock}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {selectedSizeData?.stock ? (
          <>
            Continue to Checkout
            <ChevronRight className="w-5 h-5" />
          </>
        ) : (
          'Out of Stock'
        )}
      </button>
    </div>
  )

  const renderDetailsForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Your Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  formErrors.fullName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {formErrors.fullName && (
              <p className="text-sm text-red-600 animate-fadeIn">{formErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {formErrors.email && (
              <p className="text-sm text-red-600 animate-fadeIn">{formErrors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4" />
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="01712345678"
                disabled={isSubmitting}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {formErrors.phoneNumber && (
              <p className="text-sm text-red-600 animate-fadeIn">{formErrors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              District *
            </label>
            <div className="relative">
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  formErrors.district ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Your district"
                disabled={isSubmitting}
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {formErrors.district && (
              <p className="text-sm text-red-600 animate-fadeIn">{formErrors.district}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Full Address *
          </label>
          <div className="relative">
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                formErrors.address ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="House #, Road #, Area, City"
              disabled={isSubmitting}
            />
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          {formErrors.address && (
            <p className="text-sm text-red-600 animate-fadeIn">{formErrors.address}</p>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MessageSquare className="w-4 h-4" />
            Special Instructions (Optional)
          </label>
          <div className="relative">
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                formErrors.notes ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Any special delivery instructions or notes"
              disabled={isSubmitting}
            />
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          {formErrors.notes && (
            <p className="text-sm text-red-600 animate-fadeIn">{formErrors.notes}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep('summary')}
          disabled={isSubmitting}
          className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Summary
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Place Order
            </>
          )}
        </button>
      </div>
    </form>
  )

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900">Order Confirmed!</h3>
        <p className="text-gray-600 mt-2">Thank you for your purchase</p>
        
        <div className="mt-6 p-4 bg-white rounded-xl border border-green-200 inline-block">
          <p className="text-sm text-gray-600">Order will be shipped within 3-5 business days</p>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-gray-600">Product</p>
            <p className="font-medium text-gray-900">{product.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p className="font-medium text-gray-900">{selectedSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-bold text-green-600">${formatPrice(calculateTotal())}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery</p>
            <p className="font-medium text-gray-900">3-5 days</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
        >
          Continue Shopping
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
        >
          View Order Details
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                {currentStep === 'confirm' ? 'Order Confirmation' : 'Checkout'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">Complete your purchase</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition duration-300"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}
          
          {currentStep === 'summary' && renderOrderSummary()}
          {currentStep === 'details' && renderDetailsForm()}
          {currentStep === 'confirm' && renderConfirmation()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <Truck className="w-8 h-8 text-gray-400" />
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}