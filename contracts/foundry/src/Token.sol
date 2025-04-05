// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Interface for LSP7 DigitalAsset
interface ILSP7DigitalAsset {
    function mint(address to, uint256 amount, bool force, bytes memory data) external;
    function burn(address from, uint256 amount, bytes memory data) external;
    function transfer(address from, address to, uint256 amount, bool force, bytes memory data) external;
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

// Mock implementation of LSP7 for prediction market shares
contract PredictionMarketShares {
    string private _name;
    string private _symbol;
    address private _owner;
    
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _owner = msg.sender;
    }
    
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function mint(address to, uint256 amount, bool, bytes memory) public {
        require(msg.sender == _owner, "Only owner can mint");
        _balances[to] += amount;
        _totalSupply += amount;
    }
    
    function burn(address from, uint256 amount, bytes memory) public {
        require(msg.sender == _owner, "Only owner can burn");
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _totalSupply -= amount;
    }
    
    function transfer(address from, address to, uint256 amount, bool, bytes memory) public {
        require(msg.sender == _owner || msg.sender == from, "Not authorized");
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
    }
}