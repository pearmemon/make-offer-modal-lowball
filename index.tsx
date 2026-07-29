import React, { useState, useMemo } from 'react';

const svgClose = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#222222"/>
</svg>`;
const svgChevronDown = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.1998 10.3429L11.9998 16.2397L4.7998 10.3429L6.00801 8.85693L11.9998 13.7589L17.9916 8.85693L19.1998 10.3429Z" fill="#222222"/>
</svg>`;
const svgRadioSelected = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0.5C15.2467 0.5 19.5 4.75329 19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.5 15.2467 0.5 10C0.5 4.75329 4.75329 0.5 10 0.5Z" fill="white" stroke="#222222"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16Z" fill="#222222"/>
</svg>`;
const svgRadioUnselected = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0.5C15.2467 0.5 19.5 4.75329 19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.5 15.2467 0.5 10C0.5 4.75329 4.75329 0.5 10 0.5Z" fill="white" stroke="#DDDDDD"/>
</svg>`;
const imgBolt =
  'https://www.figma.com/api/mcp/asset/f21aa0d4-3c85-408a-8c55-5df86b2874fb';

interface MakeOfferModalProps {
  listPrice: number;
  minAcceptableOffPercent?: number;
  recommendedOffPercent?: number;
  lowballMode?: 'nudge' | 'block';
  onClose?: () => void;
  onSubmit?: (offer: {
    price: number;
    message?: string;
    type: 'recommended' | 'custom';
  }) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  listPrice,
  minAcceptableOffPercent = 60,
  recommendedOffPercent = 5,
  lowballMode = 'block',
  onClose,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<'recommended' | 'custom'>(
    'recommended'
  );
  const [customPrice, setCustomPrice] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [showLowballWarning, setShowLowballWarning] = useState(false);

  const recommendedPrice = useMemo(() => {
    return Math.round(listPrice * (1 - recommendedOffPercent / 100));
  }, [listPrice, recommendedOffPercent]);

  const minAcceptablePrice = useMemo(() => {
    return Math.round(listPrice * (1 - minAcceptableOffPercent / 100));
  }, [listPrice, minAcceptableOffPercent]);

  const currentPrice =
    selectedOption === 'recommended'
      ? recommendedPrice
      : customPrice
        ? parseFloat(customPrice)
        : null;

  const discountPercent = useMemo(() => {
    if (!currentPrice) return null;
    return Math.round(((listPrice - currentPrice) / listPrice) * 100);
  }, [currentPrice, listPrice]);

  const isValidPrice = useMemo(() => {
    if (selectedOption === 'recommended') return true;
    if (lowballMode === 'nudge') return true;
    if (!customPrice) return true;
    const price = parseFloat(customPrice);
    const minPrice = listPrice * 0.5;
    return !isNaN(price) && price >= minPrice;
  }, [selectedOption, customPrice, listPrice, lowballMode]);

  const priceError = useMemo(() => {
    if (selectedOption === 'recommended') return null;
    if (!customPrice) return null;
    const price = parseFloat(customPrice);
    if (isNaN(price)) return 'Enter a valid price';
    if (lowballMode === 'block') {
      if (price < minAcceptablePrice) {
        return `Offer must be at least $${minAcceptablePrice.toLocaleString()} (${minAcceptableOffPercent}% off)`;
      }
    }
    return null;
  }, [selectedOption, customPrice, minAcceptablePrice, minAcceptableOffPercent, lowballMode]);

  const isLowballOffer = useMemo(() => {
    if (selectedOption === 'recommended') return false;
    if (!customPrice) return false;
    const price = parseFloat(customPrice);
    if (isNaN(price)) return false;
    const lowballThreshold = listPrice * 0.4;
    return price <= lowballThreshold;
  }, [selectedOption, customPrice, listPrice]);

  const handleSubmit = () => {
    if (!isValidPrice || currentPrice === null) return;

    if (lowballMode === 'nudge' && isLowballOffer && !showLowballWarning) {
      setShowLowballWarning(true);
      return;
    }

    onSubmit?.({
      price: currentPrice,
      message: message || undefined,
      type: selectedOption,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-lg" style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Make an Offer</h1>
          <p style={styles.listPrice}>
            List Price: ${listPrice.toLocaleString()}
          </p>
          <button
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close"
            dangerouslySetInnerHTML={{ __html: svgClose }}
          />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Price Options */}
          <div style={styles.priceOptions}>
            {/* Recommended Option */}
            <div style={styles.recommendedOptionGroup}>
              <div style={styles.recommendedHeader}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="priceOption"
                    value="recommended"
                    checked={selectedOption === 'recommended'}
                    onChange={() => setSelectedOption('recommended')}
                    style={styles.radioInput}
                  />
                  <div
                    style={styles.radioIcon}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedOption === 'recommended'
                          ? svgRadioSelected
                          : svgRadioUnselected,
                    }}
                  />
                </label>
                <div style={styles.priceHeaderContent}>
                  <span style={styles.priceText}>
                    ${recommendedPrice.toLocaleString()}
                  </span>
                  <span style={styles.badge}>Recommended</span>
                  <span style={styles.discountText}>
                    {recommendedOffPercent}% off
                  </span>
                </div>
              </div>
              <p style={styles.optionSubtext}>
                Seller is likely to accept {recommendedOffPercent}-20% off the
                List Price
              </p>
            </div>

            {/* Custom Price Option */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <div style={styles.customOptionContainer}>
                <label style={styles.customRadioLabel}>
                  <input
                    type="radio"
                    name="priceOption"
                    value="custom"
                    checked={selectedOption === 'custom'}
                    onChange={() => setSelectedOption('custom')}
                    style={styles.radioInput}
                  />
                  <div
                    style={styles.radioIcon}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedOption === 'custom'
                          ? svgRadioSelected
                          : svgRadioUnselected,
                    }}
                  />
                </label>
                <span style={styles.customOptionLabel}>Name Your Price</span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                  }}
                >
                  <div style={styles.customInputContainer}>
                    <div
                      style={{
                        ...styles.customInputWrapper,
                        ...(priceError && styles.inputWrapperError),
                      }}
                    >
                      <span style={styles.currencySymbolInInput}>$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder=""
                        value={customPrice}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setCustomPrice(value);
                            setShowLowballWarning(false);
                          }
                        }}
                        style={styles.priceInputField}
                      />
                      <span style={styles.usdTextInInput}>USD</span>
                    </div>
                    {customPrice &&
                      discountPercent !== null &&
                      selectedOption === 'custom' && (
                        <span style={styles.calculatedDiscount}>
                          {discountPercent}% off
                        </span>
                      )}
                  </div>
                </div>
              </div>
              {priceError && (
                <p style={{ ...styles.errorText, marginTop: '9px' }}>
                  {priceError}
                </p>
              )}
              {showLowballWarning && lowballMode === 'nudge' && (
                <p style={{ ...styles.errorText, marginTop: '9px' }}>
                  Warning: An offer significantly below the list price will
                  likely be rejected. We recommend raising your offer.
                </p>
              )}
            </div>
          </div>

          {/* Include Message Section - Not interactive for prototype */}
        </div>

        {/* Buttons */}
        <div style={styles.buttonsSection}>
          <button
            onClick={handleSubmit}
            disabled={!isValidPrice}
            style={{
              ...styles.continueButton,
              ...(isValidPrice ? {} : styles.continueButtonDisabled),
            }}
          >
            CONTINUE
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <img src={imgBolt} alt="" style={styles.boltIcon} />
          <p style={styles.urgencyText}>
            Don't miss out! The item is in 2 carts.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modal: {
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '1px 2px 8px rgba(0, 0, 0, 0.25)',
    width: '540px',
  },
  header: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '36px 36px 18px',
    alignItems: 'center',
  },
  title: {
    fontFamily: "'Cardinal Classic Short', serif",
    fontSize: '24px',
    fontWeight: 400,
    letterSpacing: '-0.5px',
    lineHeight: 1.4,
    margin: 0,
    color: '#000',
  },
  listPrice: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: 1.5,
    margin: 0,
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '24px',
    height: '24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '27px',
    padding: '18px 36px 36px',
  },
  priceOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  recommendedOptionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  recommendedHeader: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
  },
  radioLabel: {
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
    marginRight: '20px',
    alignSelf: 'flex-start',
  },
  radioInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    cursor: 'pointer',
  },
  radioIcon: {
    width: '20px',
    height: '20px',
    display: 'block',
  },
  priceHeaderContent: {
    display: 'flex',
    gap: '9px',
    alignItems: 'center',
  },
  priceText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: '#000',
  },
  badge: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#ceecc1',
    color: '#0e3c1e',
    padding: '0.5px 9px',
    borderRadius: '72px',
    whiteSpace: 'nowrap',
    lineHeight: 1.5,
  },
  discountText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#000',
  },
  optionSubtext: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.5,
    margin: 0,
    color: '#000',
    marginLeft: '38px',
  },
  customOptionGroup: {
    display: 'flex',
    gap: '9px',
    alignItems: 'center',
  },
  optionLabel: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: '#000',
    margin: 0,
    cursor: 'pointer',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    height: '40px',
    padding: '14px 9px 14px 18px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    flex: 1,
  },
  inputWrapperError: {
    border: '2px solid #950808',
  },
  currencySymbol: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#000',
  },
  priceInput: {
    flex: 1,
    textAlign: 'right',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#000',
  },
  currencyCode: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#222',
    whiteSpace: 'nowrap',
  },
  calculatedDiscount: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    color: '#000',
    whiteSpace: 'nowrap',
  },
  errorText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    color: '#950808',
    margin: '9px 0 0 0',
  },
  customOptionContainer: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
    width: '100%',
  },
  customRadioLabel: {
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
    marginRight: '20px',
    alignSelf: 'center',
  },
  customOptionLabel: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: '#000',
    margin: 0,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    marginRight: '9px',
  },
  customInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    marginRight: '36px',
  },
  customInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    width: '200px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    paddingLeft: '9px',
    paddingRight: '9px',
    boxSizing: 'border-box',
  },
  currencySymbolInInput: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#000',
    marginRight: '5px',
  },
  priceInputField: {
    flex: 1,
    minWidth: '0',
    textAlign: 'right',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#000',
    paddingRight: '5px',
  },
  usdTextInInput: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#222',
  },
  discountSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexShrink: 0,
  },
  messageToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    color: '#222',
  },
  chevronIcon: {
    width: '24px',
    height: '24px',
    transition: 'transform 0.2s ease',
  },
  messageInput: {
    width: '100%',
    minHeight: '100px',
    padding: '14px 18px',
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    border: '1px solid #ddd',
    outline: 'none',
    resize: 'none',
  },
  buttonsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    padding: '0 36px 36px 36px',
  },
  continueButton: {
    width: '100%',
    height: '50px',
    padding: 0,
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '16px',
    fontWeight: 300,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    backgroundColor: '#222',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  continueButtonDisabled: {
    backgroundColor: '#ddd',
    color: '#999',
    cursor: 'not-allowed',
  },
  footer: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px 47px',
    borderTop: '1px solid #ddd',
  },
  boltIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  urgencyText: {
    fontFamily: "'Proxima Nova', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#950808',
    margin: 0,
  },
};
