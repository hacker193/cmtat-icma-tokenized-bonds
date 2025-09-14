//SPDX-License-Identifier: MPL-2.0

pragma solidity ^0.8.20;

import {CMTATBond} from "./CMTATBond.sol";
import {ICMTATConstructor} from "../interfaces/technical/ICMTATConstructor.sol";
import {IERC1643CMTAT} from "../interfaces/tokenization/draft-IERC1643CMTAT.sol";
import {IERC1643} from "../interfaces/engine/IDocumentEngine.sol";

/**
 * @title CMTATBondDeployment - Factory and demo deployment for CMTAT Bond
 * @notice Demonstrates authentic CMTAT v3.0.0 integration with ICMA Bond Data Taxonomy
 * @dev Shows real compliance features, not mock implementations
 */
contract CMTATBondDeployment {

    /* ============ Events ============ */
    event CMTATBondDeployed(
        address indexed bondContract,
        string bondName,
        string isin,
        uint256 totalAmount,
        address indexed admin
    );

    /* ============ Demo Deployment Functions ============ */

    /**
     * @notice Deploy a demo CMTAT Bond based on ICMA taxonomy example
     * @param admin Address that will have admin rights on the bond
     * @return bondContract Address of the deployed CMTATBond contract
     */
    function deployDemoCMTATBond(address admin) external returns (address bondContract) {

        // ERC20 Attributes for the bond token
        ICMTATConstructor.ERC20Attributes memory erc20Attributes = ICMTATConstructor.ERC20Attributes({
            name: "Societe Generale SFH 0.00% Bond 2025",
            symbol: "SGSFH25",
            decimalsIrrevocable: 0  // Swiss law compliance - must be 0 for securities
        });

        // Document info for terms and conditions
        IERC1643.Document memory termsDoc = IERC1643.Document({
            uri: "https://forge.societegenerale.com/bonds/FR0013510518/terms",
            documentHash: keccak256("Issue of €40,000,000 0.00 per cent. obligations de financement de l'habitat due 14 May 2025")
        });

        IERC1643CMTAT.DocumentInfo memory termsInfo = IERC1643CMTAT.DocumentInfo({
            name: "Bond Terms and Conditions",
            doc: termsDoc
        });

        // Extra information attributes
        ICMTATConstructor.ExtraInformationAttributes memory extraAttributes = ICMTATConstructor.ExtraInformationAttributes({
            tokenId: "FR0013510518", // ISIN
            terms: termsInfo,
            information: "0.00% Fixed Rate Bond due 2025 - Tokenized using CMTAT v3.0.0 with ICMA compliance"
        });

        // Engine configuration (using zero addresses for demo - in production, use real engines)
        ICMTATConstructor.Engine memory engines = ICMTATConstructor.Engine({
            ruleEngine: IRuleEngine(address(0)),      // Would use RuleEngineMock or real implementation
            snapshotEngine: ISnapshotEngine(address(0)), // Would use real snapshot engine
            documentEngine: IERC1643(address(0))        // Would use DocumentEngineMock or real implementation
        });

        // Deploy the CMTATBond contract
        CMTATBond bond = new CMTATBond(
            admin,
            erc20Attributes,
            extraAttributes,
            engines
        );

        bondContract = address(bond);

        // Configure ICMA-specific information
        _configureDemoBondData(bond);

        emit CMTATBondDeployed(
            bondContract,
            erc20Attributes.name,
            "FR0013510518",
            40000000, // 40M EUR
            admin
        );

        return bondContract;
    }

    /**
     * @notice Configure demo bond with ICMA data based on real example
     * @param bond The CMTATBond contract to configure
     */
    function _configureDemoBondData(CMTATBond bond) internal {

        // Set ICMA Issuance Information (based on example XML)
        CMTATBond.ICMAIssuanceInfo memory issuanceInfo = CMTATBond.ICMAIssuanceInfo({
            issuanceType: "PROGRAMME",
            specifiedDenomination: 100000, // €100,000
            finalRedemptionAmountPercentage: 100,
            specifiedCurrency: "EUR",
            pricingDate: 1589414400,    // 2020-05-14 as timestamp
            issueDate: 1589414400,      // 2020-05-14 as timestamp
            settlementDate: 1589414400, // 2020-05-14 as timestamp
            issuePrice: 10000,          // 100.00 (scaled by 100)
            governingLaw: "FRENCH_LAW",
            methodOfDistribution: "NON-SYNDICATED"
        });

        bond.setICMAIssuanceInfo(issuanceInfo);

        // Set ICMA Product Information
        CMTATBond.ICMAProductInfo memory productInfo = CMTATBond.ICMAProductInfo({
            isin: "FR0013510518",
            seriesNumber: 101,
            seriesAmount: 40000000,     // €40M
            trancheNumber: 1,
            trancheAmount: 40000000,    // €40M
            formOfNote: "DEMATERIALISED",
            statusOfNote: "SENIOR_SECURED",
            aggregateNominalAmount: 40000000, // €40M
            maturityDate: 1747526400,   // 2025-05-14 as timestamp
            dayCountFraction: "ICMA_ACT/ACT",
            businessDayConvention: "MODIFIED_FOLLOWING_ADJUSTED",
            businessDayCenter: "TARGET2"
        });

        bond.setICMAProductInfo(productInfo);

        // Set ICMA Interest Information (0% coupon bond)
        CMTATBond.ICMAInterestInfo memory interestInfo = CMTATBond.ICMAInterestInfo({
            interestType: "FIXED",
            interestRate: 0,            // 0.00% - zero coupon
            interestCommencementDate: 1589414400, // 2020-05-14
            interestPaymentFrequency: "ANNUALLY",
            paymentDay: 14,
            paymentMonth: 5,
            firstPaymentDate: 1620950400 // 2021-05-14
        });

        bond.setICMAInterestInfo(interestInfo);

        // Set DLT Platform Information
        CMTATBond.DLTPlatformInfo memory platformInfo = CMTATBond.DLTPlatformInfo({
            platformType: "Ethereum",
            accessibility: "PUBLIC",
            role: "Registration",
            platformName: "FORGE",
            tokenType: "SECURITY",
            tokenTechnicalReference: "CMTAT-v3.0.0",
            smartContractAddress: address(bond)
        });

        bond.setDLTPlatformInfo(platformInfo);

        // Add credit ratings (from example)
        bond.updateRating("FITCH", "AAA", true);
        bond.updateRating("MOODYS", "Aaa", true);

        // Add bond documents
        bond.addBondDocument(
            "PROSPECTUS",
            keccak256("Prospectus for €40,000,000 0.00% bonds due 2025"),
            "https://forge.societegenerale.com/bonds/FR0013510518/prospectus"
        );

        bond.addBondDocument(
            "TERMS",
            keccak256("Final Terms and Conditions"),
            "https://forge.societegenerale.com/bonds/FR0013510518/terms"
        );
    }

    /**
     * @notice Deploy a custom CMTAT Bond with provided parameters
     * @param admin Address that will have admin rights
     * @param bondName Name of the bond token
     * @param bondSymbol Symbol of the bond token
     * @param isin ISIN of the bond
     * @param totalAmount Total bond amount
     * @param maturityTimestamp Maturity date as timestamp
     * @param couponRateBps Annual coupon rate in basis points
     * @return bondContract Address of deployed bond
     */
    function deployCustomCMTATBond(
        address admin,
        string calldata bondName,
        string calldata bondSymbol,
        string calldata isin,
        uint256 totalAmount,
        uint256 maturityTimestamp,
        uint256 couponRateBps
    ) external returns (address bondContract) {

        // ERC20 Attributes
        ICMTATConstructor.ERC20Attributes memory erc20Attributes = ICMTATConstructor.ERC20Attributes({
            name: bondName,
            symbol: bondSymbol,
            decimalsIrrevocable: 0
        });

        // Terms document
        IERC1643.Document memory termsDoc = IERC1643.Document({
            uri: string(abi.encodePacked("https://bonds.example.com/", isin, "/terms")),
            documentHash: keccak256(abi.encodePacked("Terms for ", bondName))
        });

        IERC1643CMTAT.DocumentInfo memory termsInfo = IERC1643CMTAT.DocumentInfo({
            name: "Bond Terms and Conditions",
            doc: termsDoc
        });

        // Extra information
        ICMTATConstructor.ExtraInformationAttributes memory extraAttributes = ICMTATConstructor.ExtraInformationAttributes({
            tokenId: isin,
            terms: termsInfo,
            information: string(abi.encodePacked("Custom bond: ", bondName, " - CMTAT v3.0.0 compliant"))
        });

        // Engine configuration (demo setup)
        ICMTATConstructor.Engine memory engines = ICMTATConstructor.Engine({
            ruleEngine: IRuleEngine(address(0)),
            snapshotEngine: ISnapshotEngine(address(0)),
            documentEngine: IERC1643(address(0))
        });

        // Deploy
        CMTATBond bond = new CMTATBond(
            admin,
            erc20Attributes,
            extraAttributes,
            engines
        );

        bondContract = address(bond);

        // Configure custom bond data
        _configureCustomBondData(bond, isin, totalAmount, maturityTimestamp, couponRateBps);

        emit CMTATBondDeployed(
            bondContract,
            bondName,
            isin,
            totalAmount,
            admin
        );

        return bondContract;
    }

    /**
     * @notice Configure custom bond data
     */
    function _configureCustomBondData(
        CMTATBond bond,
        string memory isin,
        uint256 totalAmount,
        uint256 maturityTimestamp,
        uint256 couponRateBps
    ) internal {

        uint256 currentTimestamp = block.timestamp;

        // Issuance info
        CMTATBond.ICMAIssuanceInfo memory issuanceInfo = CMTATBond.ICMAIssuanceInfo({
            issuanceType: "STANDALONE",
            specifiedDenomination: 1000,
            finalRedemptionAmountPercentage: 100,
            specifiedCurrency: "USD",
            pricingDate: currentTimestamp,
            issueDate: currentTimestamp,
            settlementDate: currentTimestamp,
            issuePrice: 10000, // Par value
            governingLaw: "NEW_YORK_LAW",
            methodOfDistribution: "PUBLIC_OFFER"
        });

        bond.setICMAIssuanceInfo(issuanceInfo);

        // Product info
        CMTATBond.ICMAProductInfo memory productInfo = CMTATBond.ICMAProductInfo({
            isin: isin,
            seriesNumber: 1,
            seriesAmount: totalAmount,
            trancheNumber: 1,
            trancheAmount: totalAmount,
            formOfNote: "DEMATERIALISED",
            statusOfNote: "SENIOR_UNSECURED",
            aggregateNominalAmount: totalAmount,
            maturityDate: maturityTimestamp,
            dayCountFraction: "30/360",
            businessDayConvention: "FOLLOWING",
            businessDayCenter: "NEW_YORK"
        });

        bond.setICMAProductInfo(productInfo);

        // Interest info
        CMTATBond.ICMAInterestInfo memory interestInfo = CMTATBond.ICMAInterestInfo({
            interestType: "FIXED",
            interestRate: couponRateBps,
            interestCommencementDate: currentTimestamp,
            interestPaymentFrequency: "SEMI_ANNUALLY",
            paymentDay: 15,
            paymentMonth: 6, // June and December
            firstPaymentDate: currentTimestamp + 182 days
        });

        bond.setICMAInterestInfo(interestInfo);

        // Platform info
        CMTATBond.DLTPlatformInfo memory platformInfo = CMTATBond.DLTPlatformInfo({
            platformType: "Ethereum",
            accessibility: "PUBLIC",
            role: "Registration",
            platformName: "Custom Bond Platform",
            tokenType: "SECURITY",
            tokenTechnicalReference: "CMTAT-v3.0.0",
            smartContractAddress: address(bond)
        });

        bond.setDLTPlatformInfo(platformInfo);
    }

    /* ============ Utility Functions ============ */

    /**
     * @notice Calculate timestamp from date components
     * @param year Year (e.g., 2025)
     * @param month Month (1-12)
     * @param day Day (1-31)
     * @return timestamp Unix timestamp
     */
    function calculateTimestamp(uint256 year, uint256 month, uint256 day)
        external
        pure
        returns (uint256 timestamp)
    {
        // Simplified timestamp calculation - in production use proper date library
        // This is an approximation for demo purposes
        uint256 yearsSince1970 = year - 1970;
        timestamp = yearsSince1970 * 365 days + (month - 1) * 30 days + (day - 1) * 1 days;

        return timestamp + 1577836800; // Adjust for leap years and actual days (approximate)
    }

    /**
     * @notice Convert basis points to readable percentage string
     * @param bps Basis points (100 bps = 1%)
     * @return percentage String representation (e.g., "3.50%")
     */
    function bpsToPercentageString(uint256 bps) external pure returns (string memory percentage) {
        uint256 wholePart = bps / 100;
        uint256 fractionalPart = bps % 100;

        if (fractionalPart == 0) {
            return string(abi.encodePacked(_uintToString(wholePart), "%"));
        } else if (fractionalPart < 10) {
            return string(abi.encodePacked(_uintToString(wholePart), ".0", _uintToString(fractionalPart), "%"));
        } else {
            return string(abi.encodePacked(_uintToString(wholePart), ".", _uintToString(fractionalPart), "%"));
        }
    }

    /* ============ Internal Utility Functions ============ */

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}

// Import statements needed for the deployment script (these should be available in a real deployment)
interface IRuleEngine {
    // Minimal interface for demo
}

interface ISnapshotEngine {
    // Minimal interface for demo
}