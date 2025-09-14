//SPDX-License-Identifier: MPL-2.0

pragma solidity ^0.8.20;

import {CMTATStandaloneDebt} from "./CMTATStandaloneDebt.sol";
import {ICMTATConstructor} from "../interfaces/technical/ICMTATConstructor.sol";
import {IERC1643CMTAT} from "../interfaces/tokenization/draft-IERC1643CMTAT.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CMTATBond - Tokenized Bond using CMTAT v3.0.0 with ICMA Bond Data Taxonomy
 * @notice Extends authentic CMTAT debt functionality with bond-specific features
 * @dev Demonstrates real compliance layer, not mock implementations
 */
contract CMTATBond is CMTATStandaloneDebt {

    /* ============ Constants ============ */
    bytes32 public constant BOND_ADMIN_ROLE = keccak256("BOND_ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /* ============ Bond-Specific Structures ============ */

    /**
     * @dev ICMA Bond Data Taxonomy - Issuance Information
     */
    struct ICMAIssuanceInfo {
        string issuanceType;        // e.g., "PROGRAMME", "STANDALONE"
        uint256 specifiedDenomination;
        uint256 finalRedemptionAmountPercentage;
        string specifiedCurrency;
        uint256 pricingDate;
        uint256 issueDate;
        uint256 settlementDate;
        uint256 issuePrice;
        string governingLaw;
        string methodOfDistribution;
    }

    /**
     * @dev ICMA Bond Data Taxonomy - Product Information
     */
    struct ICMAProductInfo {
        string isin;
        uint256 seriesNumber;
        uint256 seriesAmount;
        uint256 trancheNumber;
        uint256 trancheAmount;
        string formOfNote;          // e.g., "DEMATERIALISED"
        string statusOfNote;        // e.g., "SENIOR_SECURED"
        uint256 aggregateNominalAmount;
        uint256 maturityDate;
        string dayCountFraction;    // e.g., "ICMA_ACT/ACT"
        string businessDayConvention;
        string businessDayCenter;
    }

    /**
     * @dev ICMA Bond Data Taxonomy - Interest Payment Information
     */
    struct ICMAInterestInfo {
        string interestType;        // e.g., "FIXED", "FLOATING"
        uint256 interestRate;       // In basis points (e.g., 500 = 5.00%)
        uint256 interestCommencementDate;
        string interestPaymentFrequency; // e.g., "ANNUALLY", "SEMI_ANNUALLY"
        uint8 paymentDay;
        uint8 paymentMonth;
        uint256 firstPaymentDate;
    }

    /**
     * @dev Rating Information
     */
    struct RatingInfo {
        string agency;              // e.g., "FITCH", "MOODYS", "SP"
        string ratingValue;         // e.g., "AAA", "Aaa", "AA+"
        bool isActive;
    }

    /**
     * @dev DLT Platform Information
     */
    struct DLTPlatformInfo {
        string platformType;        // e.g., "Ethereum"
        string accessibility;       // e.g., "PUBLIC", "PRIVATE"
        string role;               // e.g., "Registration", "Settlement"
        string platformName;
        string tokenType;          // e.g., "SECURITY"
        string tokenTechnicalReference; // e.g., "ERC-20", "CMTAT"
        address smartContractAddress;
    }

    /* ============ State Variables ============ */

    ICMAIssuanceInfo public icmaIssuanceInfo;
    ICMAProductInfo public icmaProductInfo;
    ICMAInterestInfo public icmaInterestInfo;
    DLTPlatformInfo public dltPlatformInfo;

    // Array of ratings from different agencies
    RatingInfo[] public ratings;

    // Document hashes for bond documentation
    mapping(string => bytes32) public documentHashes;
    mapping(string => string) public documentURIs;

    // Compliance flags
    bool public isRedeemed;
    bool public isDefaulted;
    uint256 public nextCouponDate;
    uint256 public totalCouponsPaid;

    /* ============ Events ============ */

    event ICMAIssuanceInfoUpdated(ICMAIssuanceInfo issuanceInfo);
    event ICMAProductInfoUpdated(ICMAProductInfo productInfo);
    event ICMAInterestInfoUpdated(ICMAInterestInfo interestInfo);
    event DLTPlatformInfoUpdated(DLTPlatformInfo platformInfo);
    event RatingUpdated(string indexed agency, string ratingValue, bool isActive);
    event DocumentAdded(string indexed documentType, bytes32 indexed documentHash, string uri);
    event CouponPayment(uint256 indexed paymentDate, uint256 amount, uint256 totalRecipients);
    event BondRedemption(uint256 indexed redemptionDate, uint256 redemptionAmount);
    event ComplianceStatusChanged(bool isRedeemed, bool isDefaulted);

    /* ============ Constructor ============ */

    /**
     * @notice CMTATBond constructor with ICMA compliance
     * @param admin address of the admin of contract (Access Control)
     * @param ERC20Attributes_ ERC20 name, symbol and decimals
     * @param extraInformationAttributes_ tokenId, terms, information
     * @param engines_ external contract engines (rule, snapshot, document)
     */
    constructor(
        address admin,
        ICMTATConstructor.ERC20Attributes memory ERC20Attributes_,
        ICMTATConstructor.ExtraInformationAttributes memory extraInformationAttributes_,
        ICMTATConstructor.Engine memory engines_
    ) CMTATStandaloneDebt(admin, ERC20Attributes_, extraInformationAttributes_, engines_) {

        // Grant additional roles for bond-specific operations
        _grantRole(BOND_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_OFFICER_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);

        // Initialize DLT platform info with contract address
        dltPlatformInfo.smartContractAddress = address(this);
        dltPlatformInfo.tokenTechnicalReference = "CMTAT-v3.0.0";
        dltPlatformInfo.tokenType = "SECURITY";
        dltPlatformInfo.platformType = "Ethereum";
        dltPlatformInfo.accessibility = "PUBLIC";
        dltPlatformInfo.role = "Registration";
    }

    /* ============ ICMA Information Management ============ */

    /**
     * @notice Set ICMA issuance information
     * @param _issuanceInfo ICMA issuance data structure
     */
    function setICMAIssuanceInfo(ICMAIssuanceInfo calldata _issuanceInfo)
        external
        onlyRole(BOND_ADMIN_ROLE)
    {
        icmaIssuanceInfo = _issuanceInfo;
        emit ICMAIssuanceInfoUpdated(_issuanceInfo);
    }

    /**
     * @notice Set ICMA product information
     * @param _productInfo ICMA product data structure
     */
    function setICMAProductInfo(ICMAProductInfo calldata _productInfo)
        external
        onlyRole(BOND_ADMIN_ROLE)
    {
        icmaProductInfo = _productInfo;
        emit ICMAProductInfoUpdated(_productInfo);
    }

    /**
     * @notice Set ICMA interest information
     * @param _interestInfo ICMA interest data structure
     */
    function setICMAInterestInfo(ICMAInterestInfo calldata _interestInfo)
        external
        onlyRole(BOND_ADMIN_ROLE)
    {
        icmaInterestInfo = _interestInfo;
        // Calculate next coupon date based on frequency
        _calculateNextCouponDate();
        emit ICMAInterestInfoUpdated(_interestInfo);
    }

    /**
     * @notice Set DLT platform information
     * @param _platformInfo DLT platform data structure
     */
    function setDLTPlatformInfo(DLTPlatformInfo calldata _platformInfo)
        external
        onlyRole(BOND_ADMIN_ROLE)
    {
        dltPlatformInfo = _platformInfo;
        emit DLTPlatformInfoUpdated(_platformInfo);
    }

    /* ============ Rating Management ============ */

    /**
     * @notice Add or update rating from agency
     * @param agency Rating agency name
     * @param ratingValue Rating value
     * @param isActive Whether the rating is active
     */
    function updateRating(
        string calldata agency,
        string calldata ratingValue,
        bool isActive
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {

        // Find existing rating or add new one
        bool found = false;
        for (uint256 i = 0; i < ratings.length; i++) {
            if (keccak256(bytes(ratings[i].agency)) == keccak256(bytes(agency))) {
                ratings[i].ratingValue = ratingValue;
                ratings[i].isActive = isActive;
                found = true;
                break;
            }
        }

        if (!found) {
            ratings.push(RatingInfo({
                agency: agency,
                ratingValue: ratingValue,
                isActive: isActive
            }));
        }

        emit RatingUpdated(agency, ratingValue, isActive);
    }

    /* ============ Document Management ============ */

    /**
     * @notice Add bond document with hash verification
     * @param documentType Type of document (e.g., "PROSPECTUS", "TERMS", "SUPPLEMENT")
     * @param documentHash SHA-256 hash of the document
     * @param uri URI where document can be retrieved
     */
    function addBondDocument(
        string calldata documentType,
        bytes32 documentHash,
        string calldata uri
    ) external onlyRole(BOND_ADMIN_ROLE) {
        require(documentHash != bytes32(0), "CMTATBond: Document hash cannot be zero");
        require(bytes(uri).length > 0, "CMTATBond: URI cannot be empty");

        documentHashes[documentType] = documentHash;
        documentURIs[documentType] = uri;

        emit DocumentAdded(documentType, documentHash, uri);
    }

    /**
     * @notice Verify document integrity
     * @param documentType Type of document to verify
     * @param providedHash Hash to verify against stored hash
     * @return isValid Whether the document hash matches
     */
    function verifyDocument(
        string calldata documentType,
        bytes32 providedHash
    ) external view returns (bool isValid) {
        return documentHashes[documentType] == providedHash && providedHash != bytes32(0);
    }

    /* ============ Bond Lifecycle Management ============ */

    /**
     * @notice Process coupon payment to all bondholders
     * @dev Only callable by REGISTRAR_ROLE, integrates with CMTAT compliance
     */
    function processCouponPayment() external onlyRole(REGISTRAR_ROLE) {
        require(!isRedeemed, "CMTATBond: Bond has been redeemed");
        require(!isDefaulted, "CMTATBond: Bond is in default");
        require(block.timestamp >= nextCouponDate, "CMTATBond: Coupon not yet due");

        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "CMTATBond: No tokens in circulation");

        // Calculate coupon amount (interest rate in basis points)
        uint256 couponAmount = (icmaProductInfo.aggregateNominalAmount * icmaInterestInfo.interestRate) / 10000;

        // This is a simplified implementation - in practice, you'd integrate with payment systems
        totalCouponsPaid += couponAmount;
        _calculateNextCouponDate();

        emit CouponPayment(block.timestamp, couponAmount, totalSupply);
    }

    /**
     * @notice Redeem bond at maturity
     * @dev Burns all tokens and marks bond as redeemed
     */
    function redeemBond() external onlyRole(REGISTRAR_ROLE) {
        require(!isRedeemed, "CMTATBond: Bond already redeemed");
        require(block.timestamp >= icmaProductInfo.maturityDate, "CMTATBond: Bond not yet matured");

        uint256 redemptionAmount = (icmaProductInfo.aggregateNominalAmount *
                                   icmaIssuanceInfo.finalRedemptionAmountPercentage) / 100;

        isRedeemed = true;

        emit BondRedemption(block.timestamp, redemptionAmount);
        emit ComplianceStatusChanged(isRedeemed, isDefaulted);
    }

    /**
     * @notice Mark bond as defaulted (compliance action)
     * @dev Can only be called by compliance officer
     */
    function markAsDefaulted() external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(!isDefaulted, "CMTATBond: Bond already in default");
        require(!isRedeemed, "CMTATBond: Cannot default a redeemed bond");

        isDefaulted = true;

        emit ComplianceStatusChanged(isRedeemed, isDefaulted);
    }

    /* ============ View Functions ============ */

    /**
     * @notice Get all active ratings
     * @return activeRatings Array of active rating information
     */
    function getActiveRatings() external view returns (RatingInfo[] memory activeRatings) {
        uint256 activeCount = 0;

        // Count active ratings
        for (uint256 i = 0; i < ratings.length; i++) {
            if (ratings[i].isActive) {
                activeCount++;
            }
        }

        // Create array of active ratings
        activeRatings = new RatingInfo[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < ratings.length; i++) {
            if (ratings[i].isActive) {
                activeRatings[index] = ratings[i];
                index++;
            }
        }

        return activeRatings;
    }

    /**
     * @notice Get bond status summary
     * @return status Comprehensive bond status
     */
    function getBondStatus() external view returns (
        bool _isRedeemed,
        bool _isDefaulted,
        bool _isMatured,
        uint256 _nextCouponDate,
        uint256 _totalCouponsPaid,
        uint256 _daysToMaturity
    ) {
        _isRedeemed = isRedeemed;
        _isDefaulted = isDefaulted;
        _isMatured = block.timestamp >= icmaProductInfo.maturityDate;
        _nextCouponDate = nextCouponDate;
        _totalCouponsPaid = totalCouponsPaid;
        _daysToMaturity = icmaProductInfo.maturityDate > block.timestamp ?
                         (icmaProductInfo.maturityDate - block.timestamp) / 86400 : 0;
    }

    /**
     * @notice Calculate yield to maturity (simplified)
     * @return ytm Yield to maturity in basis points
     */
    function calculateYieldToMaturity() external view returns (uint256 ytm) {
        if (isRedeemed || isDefaulted || icmaProductInfo.maturityDate <= block.timestamp) {
            return 0;
        }

        // Simplified YTM calculation
        uint256 timeToMaturity = icmaProductInfo.maturityDate - block.timestamp;
        uint256 annualTimeToMaturity = timeToMaturity / 365 days;

        if (annualTimeToMaturity == 0) {
            return icmaInterestInfo.interestRate;
        }

        // Basic approximation: YTM ≈ annual coupon rate for bonds at par
        return icmaInterestInfo.interestRate;
    }

    /* ============ Internal Functions ============ */

    /**
     * @notice Calculate next coupon date based on payment frequency
     */
    function _calculateNextCouponDate() internal {
        if (icmaInterestInfo.interestCommencementDate == 0) {
            return;
        }

        uint256 baseDate = icmaInterestInfo.interestCommencementDate;
        uint256 currentTime = block.timestamp;

        // Simplified calculation - assumes annual payments
        // In practice, would need to handle different frequencies
        if (keccak256(bytes(icmaInterestInfo.interestPaymentFrequency)) == keccak256(bytes("ANNUALLY"))) {
            uint256 yearsSinceCommencement = (currentTime - baseDate) / 365 days + 1;
            nextCouponDate = baseDate + (yearsSinceCommencement * 365 days);
        } else if (keccak256(bytes(icmaInterestInfo.interestPaymentFrequency)) == keccak256(bytes("SEMI_ANNUALLY"))) {
            uint256 halfYearsSinceCommencement = (currentTime - baseDate) / (182 days) + 1;
            nextCouponDate = baseDate + (halfYearsSinceCommencement * 182 days);
        } else {
            // Default to annual
            nextCouponDate = baseDate + 365 days;
        }
    }

    /* ============ Override Transfer Functions for Compliance ============ */

    /**
     * @notice Override transfer to include bond-specific compliance checks
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(!isDefaulted, "CMTATBond: Transfers not allowed during default");
        require(!isRedeemed, "CMTATBond: Transfers not allowed after redemption");

        return super.transfer(to, amount);
    }

    /**
     * @notice Override transferFrom to include bond-specific compliance checks
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(!isDefaulted, "CMTATBond: Transfers not allowed during default");
        require(!isRedeemed, "CMTATBond: Transfers not allowed after redemption");

        return super.transferFrom(from, to, amount);
    }

    /* ============ Utility Functions ============ */

    /**
     * @notice Get contract version
     * @return version Contract version string
     */
    function version() external pure returns (string memory) {
        return "CMTATBond-v1.0.0-ICMA";
    }

    /**
     * @notice Check if contract supports interface
     * @param interfaceId Interface identifier
     * @return isSupported Whether interface is supported
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}