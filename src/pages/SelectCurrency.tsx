import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CurrencySelector() {
    const navigate = useNavigate();

    // --- State ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
    const [selectedCoin, setSelectedCoin] = useState('ETH'); // Default selection
    const [searchQuery, setSearchQuery] = useState('');

    // --- Icons ---
    const EthIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_2_14808)">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#627EEA" />
                <path d="M12 3V9.6525L17.6228 12.165L12 3Z" fill="white" fill-opacity="0.602" />
                <path d="M12.3735 3L6.75 12.165L12.3735 9.6525V3Z" fill="white" />
                <path d="M12 16.764V21.2843L17.6265 13.5L12 16.764Z" fill="white" fill-opacity="0.602" />
                <path d="M12.3735 21.2843V16.7632L6.75 13.5L12.3735 21.2843Z" fill="white" />
                <path d="M12 15.5258L17.6228 12.261L12 9.75V15.5258Z" fill="white" fill-opacity="0.2" />
                <path d="M6.75 12.261L12.3735 15.5258V9.75L6.75 12.261Z" fill="white" fill-opacity="0.602" />
            </g>
            <defs>
                <clipPath id="clip0_2_14808">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );

    const BtcIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_2_14817)">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F7931A" />
                <path d="M17.274 10.515C17.5095 8.943 16.3118 8.09775 14.6753 7.53375L15.2062 5.40375L13.9103 5.08125L13.3928 7.155C13.0523 7.0695 12.7028 6.99 12.354 6.9105L12.8752 4.82325L11.5793 4.5L11.0483 6.62925C10.7663 6.56475 10.4888 6.50175 10.2203 6.43425L10.2218 6.4275L8.43375 5.98125L8.08875 7.36575C8.08875 7.36575 9.051 7.58625 9.03075 7.59975C9.55575 7.731 9.65025 8.07825 9.6345 8.35425L9.03 10.7805C9.066 10.7895 9.1125 10.803 9.165 10.8232L9.02775 10.7895L8.18025 14.1885C8.11575 14.3475 7.953 14.5867 7.5855 14.496C7.599 14.5147 6.6435 14.2612 6.6435 14.2612L6 15.7448L7.6875 16.1655C8.001 16.2443 8.3085 16.3267 8.61075 16.404L8.0745 18.558L9.36975 18.8805L9.90075 16.7505C10.2548 16.8457 10.5983 16.9342 10.9343 17.0182L10.4047 19.1392L11.7008 19.4618L12.237 17.3123C14.448 17.7308 16.11 17.562 16.8097 15.5625C17.3737 13.953 16.782 13.0238 15.6188 12.4185C16.4663 12.2235 17.1037 11.6663 17.274 10.515ZM14.3115 14.6685C13.9118 16.2788 11.2005 15.408 10.3215 15.1898L11.034 12.336C11.913 12.5557 14.7308 12.99 14.3115 14.6685ZM14.7128 10.4918C14.3475 11.9565 12.0915 11.2118 11.3603 11.0295L12.0052 8.442C12.7365 8.62425 15.0938 8.964 14.7128 10.4918Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_2_14817">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );

    const UsdtIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_2_14826)">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#26A17B" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2165 13.173V13.1715C13.134 13.1775 12.7087 13.203 11.76 13.203C11.0025 13.203 10.4692 13.1805 10.2817 13.1715V13.1738C7.36575 13.0455 5.18925 12.5378 5.18925 11.9303C5.18925 11.3235 7.36575 10.8158 10.2817 10.6853V12.6682C10.4722 12.6817 11.0182 12.714 11.7727 12.714C12.678 12.714 13.1318 12.6765 13.2165 12.669V10.6867C16.1265 10.8165 18.2977 11.3243 18.2977 11.9303C18.2977 12.5378 16.1265 13.044 13.2165 13.173ZM13.2165 10.4805V8.706H17.277V6H6.22125V8.706H10.2817V10.4798C6.98175 10.6312 4.5 11.2852 4.5 12.0682C4.5 12.8512 6.98175 13.5045 10.2817 13.6567V19.3433H13.2165V13.6552C16.5113 13.5037 18.987 12.8505 18.987 12.0682C18.987 11.286 16.5113 10.6328 13.2165 10.4805Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_2_14826">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );

    const LtcIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_2_14835)">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#BFBBBB" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82025 14.4105L6.75 14.826L7.266 12.7568L8.349 12.3218L9.90975 6H13.7565L12.6172 10.647L13.6747 10.2188L13.1647 12.2812L12.0945 12.7095L11.4585 15.3218H17.25L16.5953 18H6.939L7.82025 14.4105Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_2_14835">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );

    const BackArrow = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
        </svg>
    );

     const currencies = [
        { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', color: '#627EEA', icon: <EthIcon /> },
        { symbol: 'BTC', name: 'Bitcoin', network: 'mainnet', color: '#F7931A', icon: <BtcIcon /> },
        { symbol: 'USDT', name: 'Tether', network: 'ethereum', color: '#26A17B', icon: <UsdtIcon /> },
        { symbol: 'LTC', name: 'Litecoin', network: 'mainnet', color: '#A6A9AA', icon: <LtcIcon /> },
    ];

    const networks = ['All Networks', 'ethereum', 'mainnet', 'solana', 'bsc'];

    // --- Logic ---
    const filteredCurrencies = currencies.filter(coin => {
        const matchesNetwork = selectedNetwork === 'All Networks' || coin.network === selectedNetwork;
        const matchesSearch = coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesNetwork && matchesSearch;
    });

    // If using TypeScript, add ': string'
    const handleNetworkSelect = (net: string) => {
        setSelectedNetwork(net);
        setIsDropdownOpen(false);
    };

    return (
        <div className="bee-container">
            <div className="figma-deposit-header">
                <button className="figma-deposit-back" onClick={() => navigate(-1)}>
                    <BackArrow />
                </button>
                <span className="figma-deposit-title">Select Currency</span>
            </div>

            <div className="bee-action-bar">
                <div className="bee-search-container">
                    <span className="bee-search-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M8.75033 1.66699C12.6623 1.66699 15.8337 4.83831 15.8337 8.75033C15.8337 10.406 15.2637 11.9274 14.3118 13.1335L18.0895 16.9111L18.1465 16.9746C18.4134 17.3019 18.3946 17.7844 18.0895 18.0895C17.7844 18.3946 17.3019 18.4134 16.9746 18.1465L16.9111 18.0895L13.1335 14.3118C11.9274 15.2637 10.406 15.8337 8.75033 15.8337C4.83831 15.8337 1.66699 12.6623 1.66699 8.75033C1.66699 4.83831 4.83831 1.66699 8.75033 1.66699ZM8.75033 3.33366C5.75878 3.33366 3.33366 5.75878 3.33366 8.75033C3.33366 11.7419 5.75878 14.167 8.75033 14.167C11.7419 14.167 14.167 11.7419 14.167 8.75033C14.167 5.75878 11.7419 3.33366 8.75033 3.33366Z" fill="white" fillOpacity="0.64" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Type a currency"
                        className="bee-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="bee-dropdown-container">
                    <div
                        className={`bee-dropdown-trigger ${isDropdownOpen ? 'bee-dropdown-open' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {selectedNetwork}
                        <span className="bee-chevron" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15.5895 7.32709C15.8946 7.63218 15.9134 8.11468 15.6464 8.44199L15.5895 8.50547L10.5895 13.5055C10.264 13.8309 9.73651 13.8309 9.41107 13.5055L4.41107 8.50547C4.08563 8.18003 4.08563 7.65252 4.41107 7.32709C4.73651 7.00165 5.26402 7.00165 5.58946 7.32709L10.0003 11.7379L14.4111 7.32709L14.4745 7.27012C14.8019 7.00316 15.2844 7.02199 15.5895 7.32709Z" fill="white" fillOpacity="0.48" />
                            </svg>
                        </span>
                    </div>

                    {isDropdownOpen && (
                        <div className="bee-dropdown-menu">
                            {networks.map((net) => (
                                <div
                                    key={net}
                                    className={`bee-menu-item ${selectedNetwork === net ? 'bee-item-active' : ''}`}
                                    onClick={() => handleNetworkSelect(net)}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {net}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <h1 className="bee-section-title">Popular Currencies</h1>

            <div className="bee-list">
                {filteredCurrencies.map((coin, index) => {
                    const isSelected = selectedCoin === coin.symbol;

                    return (
                        <div
                            className="bee-list-item"
                            key={index}
                            onClick={() => {
                                setSelectedCoin(coin.symbol);

                                // Create a clean copy of the coin object without any React components
                                const navigationData = {
                                    symbol: coin.symbol,
                                    name: coin.name,
                                    network: coin.network,
                                    color: coin.color
                                };

                                navigate(`/withdraw?currency=${coin.symbol}`, {
                                    state: { selectedCurrency: navigationData },
                                    replace: true
                                });
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                                // Optional: subtle background change on hover/selection
                                background: isSelected ? 'rgba(194, 255, 10, 0.02)' : 'transparent'
                            }}
                        >
                            {/* Left Side: Icon and Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    backgroundColor: coin.color,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {coin.icon}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                        {coin.symbol}
                                    </span>
                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                                        {coin.name}
                                    </span>
                                </div>
                            </div>

                            {/* Right Side: Network Badge and Custom Radio */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.4)',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    textTransform: 'lowercase'
                                }}>
                                    {coin.network}
                                </div>

                                {/* Radio Button Logic */}
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                                    // Dynamic Styles based on selection
                                    backgroundColor: isSelected ? '#221E37' : 'transparent',
                                    border: isSelected
                                        ? '5px solid #C2FF0A'
                                        : '1px solid rgba(255,255,255,0.3)', // 1px border, no bg
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CurrencySelector;