# CMTAT v3.0.0 Bond Integration with ICMA Taxonomy

This directory contains authentic CMTAT (Capital Markets and Technology Association Token) v3.0.0 smart contracts integrated with the ICMA (International Capital Market Association) Bond Data Taxonomy for real-world tokenized bond issuance.

## 🏗️ Architecture Overview

### Authentic CMTAT Integration
This implementation uses **real CMTAT v3.0.0 contracts**, not mock implementations:

- **CMTATStandaloneDebt.sol** - Authentic CMTAT debt token implementation
- **CMTATBond.sol** - Extends CMTAT with ICMA Bond Data Taxonomy fields
- **Full compliance layer** - Real transfer restrictions, snapshots, document management
- **Proper role-based access control** - CMTAT-compliant permissions

### ICMA Bond Data Taxonomy Compliance
Based on ICMA Bond Data Taxonomy v1.2 (February 2024):

- **Issuance Information** - Issue date, settlement, currency, denomination
- **Product Information** - ISIN, series/tranche data, maturity, day count conventions
- **Interest Information** - Coupon rates, payment frequency, calculation methods
- **Rating Information** - Multi-agency credit ratings with active status tracking
- **DLT Platform Information** - Blockchain platform details and token specifications

## 📁 Directory Structure

```
contracts/
├── deployment/
│   ├── CMTATStandaloneDebt.sol    # Authentic CMTAT debt token
│   ├── CMTATBond.sol              # Bond extension with ICMA fields
│   └── CMTATBondDeployment.sol    # Factory for demo deployments
├── modules/                        # CMTAT base modules
│   ├── 0_CMTATBaseCommon.sol      # Core CMTAT functionality
│   ├── 1_CMTATBaseRuleEngine.sol  # Rule engine integration
│   ├── 2_CMTATBaseDebt.sol        # Debt-specific features
│   └── wrapper/                    # Module wrappers
├── interfaces/                     # CMTAT interfaces
│   ├── engine/                    # Engine interfaces
│   ├── modules/                   # Module interfaces
│   ├── technical/                 # Constructor interfaces
│   └── tokenization/              # Token interfaces
└── README.md                      # This file
```

## 🚀 Key Features Demonstrated

### 1. Authentic CMTAT Compliance Layer
- **Transfer Validation** - Real compliance checks, not mock implementations
- **Pause/Freeze Functionality** - Emergency controls for compliance
- **Snapshot Capabilities** - Historical balance tracking for regulatory reporting
- **Document Management** - IPFS/URI document attachment with hash verification
- **Access Control** - Role-based permissions with proper inheritance

### 2. ICMA Bond Data Fields Integration
- **Complete Bond Metadata** - All ICMA taxonomy fields implemented
- **Credit Rating Management** - Multi-agency rating tracking with updates
- **Bond Lifecycle Events** - Issuance, coupon payments, redemption, default
- **Compliance Status Tracking** - Real-time bond status with transfer restrictions
- **Document Hash Verification** - Tamper-proof document integrity

### 3. Real-World Bond Operations
- **Coupon Payment Processing** - Automated interest distribution
- **Maturity Handling** - Proper redemption at maturity date
- **Default Management** - Compliance officer controlled default status
- **Transfer Restrictions** - Prevent transfers during default/redemption
- **Yield Calculations** - Built-in yield-to-maturity calculations

## 🛠️ Usage Examples

### Deploy Demo Bond (Based on Societe Generale Example)

```solidity
// Deploy factory
CMTATBondDeployment factory = new CMTATBondDeployment();

// Deploy demo bond with real ICMA data
address bondAddress = factory.deployDemoCMTATBond(admin);

// Get bond instance
CMTATBond bond = CMTATBond(bondAddress);
```

### Configure ICMA Information

```solidity
// Set issuance information
ICMAIssuanceInfo memory issuanceInfo = ICMAIssuanceInfo({
    issuanceType: "PROGRAMME",
    specifiedDenomination: 100000,    // €100,000
    finalRedemptionAmountPercentage: 100,
    specifiedCurrency: "EUR",
    // ... other fields
});
bond.setICMAIssuanceInfo(issuanceInfo);

// Add credit ratings
bond.updateRating("FITCH", "AAA", true);
bond.updateRating("MOODYS", "Aaa", true);
```

### Document Management

```solidity
// Add bond documentation
bytes32 prospectusHash = keccak256("Prospectus content");
bond.addBondDocument(
    "PROSPECTUS",
    prospectusHash,
    "https://bonds.example.com/prospectus.pdf"
);

// Verify document integrity
bool isValid = bond.verifyDocument("PROSPECTUS", providedHash);
```

### Bond Lifecycle Management

```solidity
// Process coupon payment (REGISTRAR_ROLE required)
bond.processCouponPayment();

// Mark as defaulted (COMPLIANCE_OFFICER_ROLE required)
bond.markAsDefaulted();

// Redeem at maturity (REGISTRAR_ROLE required)
bond.redeemBond();
```

## 🔒 Compliance Features

### Access Control Roles
- **DEFAULT_ADMIN_ROLE** - Full contract administration
- **BOND_ADMIN_ROLE** - Bond configuration and ICMA data management
- **COMPLIANCE_OFFICER_ROLE** - Rating updates and default management
- **REGISTRAR_ROLE** - Coupon payments and redemption

### Transfer Restrictions
```solidity
// Transfers blocked during default
require(!isDefaulted, "CMTATBond: Transfers not allowed during default");

// Transfers blocked after redemption
require(!isRedeemed, "CMTATBond: Transfers not allowed after redemption");
```

### Compliance Status Tracking
```solidity
struct BondStatus {
    bool isRedeemed;
    bool isDefaulted;
    bool isMatured;
    uint256 nextCouponDate;
    uint256 totalCouponsPaid;
    uint256 daysToMaturity;
}
```

## 📊 ICMA Taxonomy Implementation

### Data Structures

#### Issuance Information
```solidity
struct ICMAIssuanceInfo {
    string issuanceType;                    // PROGRAMME, STANDALONE
    uint256 specifiedDenomination;          // Minimum investment amount
    uint256 finalRedemptionAmountPercentage; // Usually 100%
    string specifiedCurrency;               // EUR, USD, etc.
    uint256 pricingDate;                    // Unix timestamp
    uint256 issueDate;                      // Unix timestamp
    uint256 settlementDate;                 // Unix timestamp
    uint256 issuePrice;                     // Price in basis points
    string governingLaw;                    // Legal jurisdiction
    string methodOfDistribution;            // Distribution method
}
```

#### Product Information
```solidity
struct ICMAProductInfo {
    string isin;                      // International Securities ID
    uint256 seriesNumber;             // Bond series number
    uint256 seriesAmount;             // Total series amount
    uint256 trancheNumber;            // Tranche number within series
    uint256 trancheAmount;            // Amount in this tranche
    string formOfNote;                // DEMATERIALISED, CERTIFICATED
    string statusOfNote;              // SENIOR_SECURED, SENIOR_UNSECURED, etc.
    uint256 aggregateNominalAmount;   // Total nominal amount
    uint256 maturityDate;             // Maturity as Unix timestamp
    string dayCountFraction;          // Day count convention
    string businessDayConvention;     // Business day handling
    string businessDayCenter;         // Business day center
}
```

#### Interest Information
```solidity
struct ICMAInterestInfo {
    string interestType;              // FIXED, FLOATING
    uint256 interestRate;             // Rate in basis points
    uint256 interestCommencementDate; // Start of interest accrual
    string interestPaymentFrequency;  // ANNUALLY, SEMI_ANNUALLY, etc.
    uint8 paymentDay;                 // Day of payment
    uint8 paymentMonth;               // Month of payment
    uint256 firstPaymentDate;         // First coupon payment date
}
```

## 🧪 Testing

### Integration Tests
Comprehensive test suite covering:
- CMTAT architecture validation
- ICMA taxonomy data integrity
- Document management and verification
- Rating management
- Bond lifecycle operations
- Transfer compliance
- Access control validation

### Run Tests
```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run integration tests only
npm run test:integration

# Generate coverage report
npm run coverage

# Generate gas usage report
npm run gas-report
```

## 🚦 Deployment

### Demo Deployment (Societe Generale Example)
```bash
# Deploy demo bond
npm run deploy:demo

# Deploy custom bond
npm run deploy:custom
```

### Custom Deployment
```typescript
import { deployForTesting, createCustomBondConfig } from './scripts/deploy-cmtat-bond';

// Create custom configuration
const config = await createCustomBondConfig(
    "Example Corp 5.25% Notes 2028",
    "EXMP28",
    "US12345678901",
    50000000,  // $50M
    5.25,      // 5.25% coupon
    2028       // Maturity year
);

// Deploy with configuration
const { deploymentContract, bondAddress } = await deployCustomBond(config);
```

## 🔍 Contract Verification

The contracts demonstrate authentic CMTAT v3.0.0 features:

1. **Real Compliance Architecture** - Uses actual CMTAT modules, not mocks
2. **ERC-20 Compatibility** - Full ERC-20 interface with compliance overlay
3. **Swiss Law Compliance** - Zero decimals for security token compliance
4. **Document Management** - IERC1643 compliant document attachment
5. **Access Control** - OpenZeppelin AccessControl with CMTAT roles
6. **Upgrade Safety** - Proper initialization and upgrade patterns

## 📝 License

This implementation follows the CMTAT MPL-2.0 license for authentic compliance module usage while demonstrating integration with ICMA Bond Data Taxonomy standards.

## 🤝 Integration Notes

### Production Considerations
- **Engine Integration** - Connect to production RuleEngine, SnapshotEngine, DocumentEngine
- **Oracle Integration** - Real-time interest rate and rating feeds
- **Payment Systems** - Integration with traditional payment rails
- **Regulatory Compliance** - Full KYC/AML integration through CMTAT rules
- **Multi-chain Support** - Cross-chain bridge integration for liquidity

### CMTAT Engine Requirements
For production deployment, integrate with:
- **RuleEngine** - Custom compliance rules and transfer validation
- **SnapshotEngine** - Regulatory reporting and historical tracking
- **DocumentEngine** - IPFS or traditional document storage integration

This implementation provides a complete foundation for real-world tokenized bond issuance using authentic CMTAT v3.0.0 architecture with full ICMA compliance.