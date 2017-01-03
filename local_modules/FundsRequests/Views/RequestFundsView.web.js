// Copyright (c) 2014-2017, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const View = require('../../Views/View.web')
const commonComponents_tables = require('../../WalletAppCommonComponents/tables.web.js')
const commonComponents_forms = require('../../WalletAppCommonComponents/forms.web.js')
//
class RequestFundsView extends View
{
	constructor(options, context)
	{
		super(options, context) // call super before `this`
		//
		const self = this 
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
	}
	setup_views()
	{
		const self = this
		{
			self.layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
			//
			self.layer.style.width = "calc(100% - 20px)"
			self.layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
			//
			self.layer.style.backgroundColor = "#282527" // so we don't get a strange effect when pushing self on a stack nav view
			//
			self.layer.style.color = "#c0c0c0" // temporary
			//
			self.layer.style.overflowY = "scroll"
			self.layer.style.padding = "0 10px 40px 10px" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
			//
			self.layer.style.wordBreak = "break-all" // to get the text to wrap
		}
		{ // validation message
			const layer = commonComponents_tables.New_inlineMessageDialogLayer("")
			layer.ClearAndHideMessage()
			self.validationMessageLayer = layer
			self.layer.appendChild(layer)				
		}
		{ // inputs
			const containerLayer = document.createElement("div")
			{ // parameters
				containerLayer.style.border = "1px solid #888"
				containerLayer.style.borderRadius = "5px"
			}
			{ // hierarchy
				{
					const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
					{
						const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("To Wallet")
						div.appendChild(labelLayer)
						//
						const valueLayer = commonComponents_forms.New_fieldValue_walletSelectLayer({
							walletsListController: self.context.walletsListController,
							didChangeWalletSelection_fn: function(selectedWallet)
							{
								self.wallet = selectedWallet
							}
						})
						div.appendChild(valueLayer)
						//
						valueLayer.ExecuteWhenBooted(
							function()
							{
								self.wallet = valueLayer.CurrentlySelectedWallet
							}
						)
					}
					{ // to get the height
						div.appendChild(commonComponents_tables.New_clearingBreakLayer())
					}
					containerLayer.appendChild(div)
				}
				{ // Request funds from sender
					const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
					{
						const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("Amount") // note use of _forms.
						div.appendChild(labelLayer)
						//
						const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
							placeholderText: "XMR"
						})
						self.amountInputLayer = valueLayer
						{
							var __valueLayer_debounceTimeout = null
							valueLayer.addEventListener(
								"keyup",
								function(event)
								{
									{ // (re)set state
										self.amount = valueLayer.value
										self.hasAnalyzedAndResolveAmountInfo = false
									}									
									if (event.keyCode === 13) {
										self._tryToGenerateRequest()
										return
									}
								}
							)
						}
						div.appendChild(valueLayer)
					}
					{ // to get the height
						div.appendChild(commonComponents_tables.New_clearingBreakLayer())
					}
					containerLayer.appendChild(div)
				}
				{
					containerLayer.appendChild(commonComponents_tables.New_separatorLayer())
				}
				{ // Request funds from sender
					const div = commonComponents_forms.New_fieldContainerLayer() // note use of _forms.
					{
						const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("From") // note use of _forms.
						div.appendChild(labelLayer)
						//
						const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer({
							placeholderText: "Contact"
						})
						self.contactInputLayer = valueLayer
						{
							var __valueLayer_debounceTimeout = null
							valueLayer.addEventListener(
								"keyup",
								function(event)
								{
									{ // (re)set state
										self.contact_id = valueLayer.value
										self.hasAnalyzedAndResolveContactInfo = false
									}									
									if (event.keyCode === 13) {
										self._tryToGenerateRequest()
										return
									}
								}
							)
						}
						div.appendChild(valueLayer)
					}
					{ // to get the height
						div.appendChild(commonComponents_tables.New_clearingBreakLayer())
					}
					containerLayer.appendChild(div)
				}
			}
			self.layer.appendChild(containerLayer)
		}
		{
			self.layer.appendChild(commonComponents_tables.New_separatorLayer())
		}
		{ // generatedRequest_layer
			const containerLayer = document.createElement("div")
			{
			}
			self.generatedRequest_layer = containerLayer
			self.layer.appendChild(containerLayer)
		}
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		return "Request Monero"
	}
	Navigation_New_RightBarButtonView()
	{
		const self = this
		const view = new View({ tag: "a" }, self.context)
		const layer = view.layer
		{ // setup/style
			layer.href = "#" // to make it clickable
			layer.innerHTML = "Generate"
		}
		{
			layer.style.display = "block"
			layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
			layer.style.marginTop = "10px"
			layer.style.width = "90px"
			layer.style.height = "24px"
			layer.style.cornerRadius = "2px"
			layer.style.backgroundColor = "#18bbec"
			layer.style.textDecoration = "none"
			layer.style.fontSize = "22px"
			layer.style.lineHeight = "112%" // % extra to get + aligned properly
			layer.style.color = "#ffffff"
			layer.style.fontWeight = "bold"
			layer.style.textAlign = "center"
		}
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					{
						self._tryToGenerateRequest()
					}
					return false
				}
			)
		}
		return view
	}
	//
	//
	// Runtime - Imperatives - Request generation
	//
	_tryToGenerateRequest()
	{
		const self = this
		//
		if (typeof self.wallet === 'undefined' || !self.wallet) {
			self.validationMessageLayer.SetValidationError("Please create a wallet to create a request.")
			return
		}
		if (typeof self.amount === 'undefined' || !self.amount) {
			self.validationMessageLayer.SetValidationError("Please enter a Monero amount to request.")
			return
		}
		if (self.hasAnalyzedAndResolveAmountInfo === false) {
			// TODO: validate amount here
			const amount_isValid = true // TODO: just for now
			if (amount_isValid === true) {
				self.hasAnalyzedAndResolveAmountInfo = undefined // reset
			}
		}
		//
		// We can assume that we have a password by this point, because we have a wallet (above)
		//
		var payment_id = null
		if (typeof self.contact !== 'undefined' && self.contact) {
			payment_id = contact.payment_id
		}
		{
			self.validationMessageLayer.ClearAndHideMessage()
			//
			self.amountInputLayer.value = ""
			self.contactInputLayer.value = "" // TODO: update this when we build the contacts selector
		}		
		self.context.fundsRequestsListController.WhenBooted_AddFundsRequest(
			self.wallet.public_address,
			payment_id,
			self.amount,
			self.description, // AKA label; no support yet?
			self.message, // no support yet?
			function(err, fundsRequest)
			{
				if (err) {
					console.error("Error while creating funds request", err)
					// TODO: show "validation" error here
					return
				}
				const GeneratedRequestView = require('./GeneratedRequestView.web')
				const options = 
				{
					fundsRequest: fundsRequest
				}
				const view = new GeneratedRequestView(options, self.context)
				self.navigationController.PushView(
					view,
					true
				)
			}
		)
	}
	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		{
			if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
				self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
				self.layer.style.height = `calc(100% - ${self.navigationController.NavigationBarHeight()}px)`
			}
		}
	}
	viewDidAppear()
	{
		const self = this
		super.viewDidAppear()
		// teardown any child/referenced stack navigation views if necessary…
	}
}
module.exports = RequestFundsView