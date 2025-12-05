import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, Crown, Sparkles, CreditCard, Smartphone, Building2, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  AFRICAN_CURRENCIES,
  convertPrice,
  Currency,
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
} from '@/constants/currencies';

interface UserData {
  userType: 'professional' | 'recruiter' | 'company';
  fullName?: string;
  companyName?: string;
  email: string;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    AFRICAN_CURRENCIES.find((c) => c.code === 'GHS') || AFRICAN_CURRENCIES[0]
  );
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mobile_money' | 'bank_transfer' | 'debit_card' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    mobileNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: '',
    accountNumber: '',
  });

  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const userPlan = SUBSCRIPTION_PLANS.find((plan) => plan.userType === user?.userType);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: 'mobile_money' | 'bank_transfer' | 'debit_card') => {
    setSelectedPaymentMethod(method);
  };

  const processPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === 'mobile_money' && !paymentDetails.mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (selectedPaymentMethod === 'debit_card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv) {
        Alert.alert('Error', 'Please enter all card details');
        return;
      }
    }

    if (selectedPaymentMethod === 'bank_transfer' && !paymentDetails.accountNumber) {
      Alert.alert('Error', 'Please enter your account number');
      return;
    }

    const price = userPlan ? convertPrice(userPlan.priceUSD, selectedCurrency) : '';
    setShowPaymentModal(false);
    
    setTimeout(() => {
      Alert.alert(
        'Payment Processing',
        `Your ${selectedPaymentMethod.replace('_', ' ')} payment of ${price} is being processed. You will be notified once confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    }, 300);
  };

  if (!userPlan || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No subscription plan available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.crownIcon}>
              <Crown color={Colors.white} size={40} strokeWidth={2} />
            </View>
            <Text style={styles.heroTitle}>Upgrade to Premium</Text>
            <Text style={styles.heroSubtitle}>
              Unlock all features and accelerate your success
            </Text>
          </LinearGradient>

          <Pressable
            style={styles.currencySelector}
            onPress={() => setShowCurrencyModal(true)}
          >
            <View>
              <Text style={styles.currencyLabel}>Currency</Text>
              <Text style={styles.currencyValue}>
                {selectedCurrency.country} ({selectedCurrency.code})
              </Text>
            </View>
            <Sparkles color={Colors.primary} size={20} />
          </Pressable>

          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{userPlan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {convertPrice(userPlan.priceUSD, selectedCurrency)}
                </Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              {selectedCurrency.code !== 'USD' && (
                <Text style={styles.usdPrice}>≈ ${userPlan.priceUSD}/month</Text>
              )}
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What&apos;s Included:</Text>
              {userPlan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.checkIcon}>
                    <Check color={Colors.primary} size={18} strokeWidth={3} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.subscribeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => handleSubscribe(userPlan)}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeButtonGradient}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.otherPlansSection}>
            <Text style={styles.otherPlansTitle}>Other Premium Plans</Text>
            {SUBSCRIPTION_PLANS.filter((plan) => plan.userType !== user.userType).map(
              (plan) => (
                <View key={plan.id} style={styles.otherPlanCard}>
                  <View style={styles.otherPlanHeader}>
                    <Text style={styles.otherPlanName}>{plan.name}</Text>
                    <Text style={styles.otherPlanPrice}>
                      {convertPrice(plan.priceUSD, selectedCurrency)}/mo
                    </Text>
                  </View>
                  <Text style={styles.otherPlanDescription}>
                    {plan.features.slice(0, 3).join(' • ')}
                  </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

        <Modal
          visible={showCurrencyModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCurrencyModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Currency</Text>
              <ScrollView style={styles.currencyList}>
                {AFRICAN_CURRENCIES.map((currency) => (
                  <Pressable
                    key={currency.code}
                    style={({ pressed }) => [
                      styles.currencyItem,
                      pressed && styles.currencyItemPressed,
                      selectedCurrency.code === currency.code &&
                        styles.currencyItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCurrency(currency);
                      setShowCurrencyModal(false);
                    }}
                  >
                    <Text style={styles.currencyItemText}>
                      {currency.country} ({currency.code})
                    </Text>
                    <Text style={styles.currencyItemSymbol}>{currency.symbol}</Text>
                    {selectedCurrency.code === currency.code && (
                      <View style={styles.selectedCheck}>
                        <Check color={Colors.white} size={16} strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={showPaymentModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.paymentModalOverlay}>
            <View style={styles.paymentModalContent}>
              <View style={styles.paymentModalHeader}>
                <Text style={styles.paymentModalTitle}>Select Payment Method</Text>
                <Pressable
                  onPress={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod(null);
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.paymentMethodsScroll}>
                <Text style={styles.paymentAmountText}>
                  Amount: {userPlan && convertPrice(userPlan.priceUSD, selectedCurrency)}/month
                </Text>

                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === 'mobile_money' && styles.paymentMethodSelected,
                  ]}
                  onPress={() => handlePaymentMethodSelect('mobile_money')}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Smartphone color={selectedPaymentMethod === 'mobile_money' ? Colors.white : Colors.primary} size={24} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodTitle,
                      selectedPaymentMethod === 'mobile_money' && styles.paymentMethodTitleSelected,
                    ]}>Mobile Money</Text>
                    <Text style={[
                      styles.paymentMethodDescription,
                      selectedPaymentMethod === 'mobile_money' && styles.paymentMethodDescriptionSelected,
                    ]}>Pay with MTN, Vodafone, AirtelTigo</Text>
                  </View>
                  {selectedPaymentMethod === 'mobile_money' && (
                    <View style={styles.selectedIndicator}>
                      <Check color={Colors.white} size={16} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>

                {selectedPaymentMethod === 'mobile_money' && (
                  <View style={styles.paymentInputContainer}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="024 123 4567"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="phone-pad"
                      value={paymentDetails.mobileNumber}
                      onChangeText={(text) => setPaymentDetails({ ...paymentDetails, mobileNumber: text })}
                    />
                  </View>
                )}

                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === 'debit_card' && styles.paymentMethodSelected,
                  ]}
                  onPress={() => handlePaymentMethodSelect('debit_card')}
                >
                  <View style={styles.paymentMethodIcon}>
                    <CreditCard color={selectedPaymentMethod === 'debit_card' ? Colors.white : Colors.primary} size={24} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodTitle,
                      selectedPaymentMethod === 'debit_card' && styles.paymentMethodTitleSelected,
                    ]}>Debit Card</Text>
                    <Text style={[
                      styles.paymentMethodDescription,
                      selectedPaymentMethod === 'debit_card' && styles.paymentMethodDescriptionSelected,
                    ]}>Visa, Mastercard, Verve</Text>
                  </View>
                  {selectedPaymentMethod === 'debit_card' && (
                    <View style={styles.selectedIndicator}>
                      <Check color={Colors.white} size={16} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>

                {selectedPaymentMethod === 'debit_card' && (
                  <View style={styles.paymentInputContainer}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="number-pad"
                      maxLength={19}
                      value={paymentDetails.cardNumber}
                      onChangeText={(text) => setPaymentDetails({ ...paymentDetails, cardNumber: text })}
                    />
                    <View style={styles.cardDetailsRow}>
                      <View style={styles.cardDetailHalf}>
                        <Text style={styles.inputLabel}>Expiry</Text>
                        <TextInput
                          style={styles.paymentInput}
                          placeholder="MM/YY"
                          placeholderTextColor={Colors.textLight}
                          keyboardType="number-pad"
                          maxLength={5}
                          value={paymentDetails.cardExpiry}
                          onChangeText={(text) => setPaymentDetails({ ...paymentDetails, cardExpiry: text })}
                        />
                      </View>
                      <View style={styles.cardDetailHalf}>
                        <Text style={styles.inputLabel}>CVV</Text>
                        <TextInput
                          style={styles.paymentInput}
                          placeholder="123"
                          placeholderTextColor={Colors.textLight}
                          keyboardType="number-pad"
                          maxLength={3}
                          secureTextEntry
                          value={paymentDetails.cardCvv}
                          onChangeText={(text) => setPaymentDetails({ ...paymentDetails, cardCvv: text })}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === 'bank_transfer' && styles.paymentMethodSelected,
                  ]}
                  onPress={() => handlePaymentMethodSelect('bank_transfer')}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Building2 color={selectedPaymentMethod === 'bank_transfer' ? Colors.white : Colors.primary} size={24} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodTitle,
                      selectedPaymentMethod === 'bank_transfer' && styles.paymentMethodTitleSelected,
                    ]}>Bank Transfer</Text>
                    <Text style={[
                      styles.paymentMethodDescription,
                      selectedPaymentMethod === 'bank_transfer' && styles.paymentMethodDescriptionSelected,
                    ]}>Direct bank transfer</Text>
                  </View>
                  {selectedPaymentMethod === 'bank_transfer' && (
                    <View style={styles.selectedIndicator}>
                      <Check color={Colors.white} size={16} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>

                {selectedPaymentMethod === 'bank_transfer' && (
                  <View style={styles.paymentInputContainer}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="e.g. GCB Bank"
                      placeholderTextColor={Colors.textLight}
                      value={paymentDetails.bankName}
                      onChangeText={(text) => setPaymentDetails({ ...paymentDetails, bankName: text })}
                    />
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="Account number"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="number-pad"
                      value={paymentDetails.accountNumber}
                      onChangeText={(text) => setPaymentDetails({ ...paymentDetails, accountNumber: text })}
                    />
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.processPaymentButton,
                    pressed && styles.buttonPressed,
                    !selectedPaymentMethod && styles.processPaymentButtonDisabled,
                  ]}
                  onPress={processPayment}
                  disabled={!selectedPaymentMethod}
                >
                  <LinearGradient
                    colors={selectedPaymentMethod ? [Colors.primary, Colors.secondary] : [Colors.textLight, Colors.textLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.processPaymentGradient}
                  >
                    <Text style={styles.processPaymentText}>Process Payment</Text>
                    <ArrowRight color={Colors.white} size={20} />
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  crownIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.95,
  },
  currencySelector: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
    fontWeight: '600',
  },
  currencyValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '600',
    marginLeft: 4,
  },
  usdPrice: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  otherPlansSection: {
    marginTop: 8,
  },
  otherPlansTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  otherPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  otherPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otherPlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  otherPlanPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  otherPlanDescription: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  currencyList: {
    marginBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.light,
  },
  currencyItemPressed: {
    opacity: 0.7,
  },
  currencyItemSelected: {
    backgroundColor: Colors.primary,
  },
  currencyItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  currencyItemSymbol: {
    fontSize: 18,
    color: Colors.textLight,
    fontWeight: '700',
    marginRight: 12,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textLight,
    fontWeight: '600',
  },
  paymentMethodsScroll: {
    padding: 20,
  },
  paymentAmountText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.light,
    borderRadius: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.secondary,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  paymentMethodTitleSelected: {
    color: Colors.white,
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: Colors.textLight,
  },
  paymentMethodDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInputContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
    marginTop: 8,
  },
  paymentInput: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardDetailHalf: {
    flex: 1,
  },
  processPaymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  processPaymentButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  processPaymentGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  processPaymentText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
