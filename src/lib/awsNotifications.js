/**
 * AWS SNS Integration for WalletX Email Notifications
 * Sends email notifications when escrow transactions are created
 */

// AWS SNS configuration
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1'
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
const SNS_TOPIC_ARN = import.meta.env.VITE_AWS_SNS_TOPIC_ARN

/**
 * Get blockchain explorer URL for transaction
 * @param {string} blockchain - The blockchain name
 * @param {string} network - The network name
 * @param {string} txHash - Transaction hash
 * @returns {string} Explorer URL
 */
const getExplorerUrl = (blockchain, network, txHash) => {
  const explorerUrls = {
    polygon: {
      testnet: 'https://amoy.polygonscan.com',
      mainnet: 'https://polygonscan.com'
    },
    base: {
      testnet: 'https://sepolia.basescan.org',
      mainnet: 'https://basescan.org'
    },
    sepolia: {
      testnet: 'https://sepolia.etherscan.io',
      mainnet: 'https://etherscan.io'
    },
    bnb: {
      testnet: 'https://testnet.bscscan.com',
      mainnet: 'https://bscscan.com'
    },
    zetachain: {
      testnet: 'https://zetachain-athens-3.blockscout.com',
      mainnet: 'https://zetachain.blockscout.com'
    },
    somnia: {
      testnet: 'https://somnia-testnet.blockscout.com',
      mainnet: 'https://somnia.blockscout.com'
    },
    lisk: {
      testnet: 'https://sepolia-blockscout.lisk.com',
      mainnet: 'https://blockscout.lisk.com'
    },
    citera: {
      testnet: 'https://explorer-testnet.citera.network',
      mainnet: 'https://explorer.citera.network'
    }
  }

  const baseUrl = explorerUrls[blockchain]?.[network] || explorerUrls[blockchain]?.testnet
  return baseUrl ? `${baseUrl}/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`
}/**

 * Fallback email service using EmailJS
 * @param {Object} escrowData - Escrow transaction data
 * @returns {Promise<boolean>} Success status
 */
const sendFallbackEmail = async (escrowData) => {
  try {
    console.log('🔄 Attempting to send email via EmailJS...')
    
    // Import EmailJS properly
    const emailjs = await import('@emailjs/browser')
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    console.log('📧 EmailJS Config:', {
      serviceId: serviceId ? '✅ Set' : '❌ Missing',
      templateId: templateId ? '✅ Set' : '❌ Missing',
      publicKey: publicKey ? '✅ Set' : '❌ Missing',
      targetEmail: escrowData.email
    })

    if (!serviceId || !templateId || !publicKey) {
      console.warn('❌ EmailJS not properly configured')
      return false
    }
    
    console.log(`🎯 Attempting to send email to: ${escrowData.email}`)
    console.log(`📧 Note: If email goes to wrong address, check EmailJS template configuration`)

    const explorerUrl = getExplorerUrl(escrowData.blockchain, escrowData.network, escrowData.txHash)

    // Use EmailJS sendForm method to send directly to user's email
    console.log('📤 Sending EmailJS email to:', escrowData.email)
    
    // Create a temporary form data to send email directly
    const tempForm = document.createElement('form')
    tempForm.style.display = 'none'
    
    // Add form fields matching EmailJS template variables
    const fields = {
      email: escrowData.email,  // This matches {{email}} in your EmailJS template
      name: 'WalletX Team',     // This matches {{name}} in your EmailJS template
      message: `🎉 WalletX Escrow Created Successfully!

📋 Escrow Details:
• Amount: ${escrowData.amount} ${escrowData.symbol}
• Recipient: ${escrowData.recipient}
• Network: ${escrowData.blockchain}
• Transaction Hash: ${escrowData.txHash}

🔗 View on Explorer: ${explorerUrl}

�️ Security Information:
Your funds are now securely held in the WalletX smart contract. The recipient can claim them, or you can refund if unclaimed.

📱 Track Your Escrow:
Visit https://walletx.software to monitor your escrow status.

Thank you for using WalletX! 🚀

---
WalletX Team
https://walletx.software`,
      reply_to: 'noreply@walletx.software'
    }
    
    // Add fields to form
    Object.keys(fields).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = fields[key]
      tempForm.appendChild(input)
    })
    
    document.body.appendChild(tempForm)
    
    try {
      // Use sendForm method which respects the to_email field better
      const result = await emailjs.sendForm(serviceId, templateId, tempForm, publicKey)
      console.log('✅ EmailJS email sent successfully to:', escrowData.email)
      console.log('📧 EmailJS result:', result)
      
      // Clean up
      document.body.removeChild(tempForm)
      return true
      
    } catch (formError) {
      console.log('⚠️ EmailJS sendForm failed, trying regular send method')
      document.body.removeChild(tempForm)
      
      // Fallback to regular send method with correct EmailJS template variables
      const templateParams = {
        email: escrowData.email,  // This matches {{email}} in your EmailJS template
        name: 'WalletX Team',     // This matches {{name}} in your EmailJS template
        message: `🎉 WalletX Escrow Created Successfully!

Amount: ${escrowData.amount} ${escrowData.symbol}
Recipient: ${escrowData.recipient}
Network: ${escrowData.blockchain}
Transaction: ${escrowData.txHash}

View on Explorer: ${explorerUrl}

Your funds are securely held in the smart contract.
Visit https://walletx.software to manage your escrow.

Thank you for using WalletX! 🚀`
      }
      
      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
      console.log('✅ EmailJS fallback send successful')
      return true
    }
    
    console.log('✅ EmailJS notification sent successfully:', result)
    return true

  } catch (error) {
    console.error('❌ EmailJS notification failed:', error)
    
    // Show user-friendly error message
    if (error.text && error.text.includes('Invalid grant')) {
      console.error('🔑 EmailJS Gmail connection expired. Please reconnect your Gmail account in EmailJS dashboard.')
    }
    
    // Try alternative email method as last resort
    console.log('🔄 Trying alternative email notification method...')
    return await sendAlternativeEmail(escrowData)
  }
}

/**
 * Alternative email method using Web3Forms or similar service
 * @param {Object} escrowData - Escrow transaction data
 * @returns {Promise<boolean>} Success status
 */
const sendAlternativeEmail = async (escrowData) => {
  try {
    console.log('📧 Sending alternative email notification to:', escrowData.email)
    
    const explorerUrl = getExplorerUrl(escrowData.blockchain, escrowData.network, escrowData.txHash)
    
    // Use a simple fetch to send email via Web3Forms (free service)
    const formData = new FormData()
    formData.append('access_key', 'YOUR_WEB3FORMS_KEY') // You'd need to get this from web3forms.com
    formData.append('email', escrowData.email)
    formData.append('subject', `🎉 WalletX Escrow Created - ${escrowData.amount} ${escrowData.symbol}`)
    formData.append('message', `
🎉 WalletX Escrow Created Successfully!

📋 Escrow Details:
• Amount: ${escrowData.amount} ${escrowData.symbol}
• Recipient: ${escrowData.recipient}
• Network: ${escrowData.blockchain}
• Transaction: ${escrowData.txHash}

🔗 View on Explorer: ${explorerUrl}

Your funds are securely held in the smart contract.
Visit https://walletx.software to manage your escrow.

Thank you for using WalletX! 🚀
    `)
    
    // For now, just log the attempt since we don't have Web3Forms configured
    console.log('📧 Alternative email would be sent to:', escrowData.email)
    console.log('💡 To enable this, sign up at web3forms.com and add the access key')
    
    // Return false for now since this is just a placeholder
    return false
    
  } catch (error) {
    console.error('❌ Alternative email method failed:', error)
    return false
  }
}

/**
 * Send escrow creation notification via AWS SNS or EmailJS fallback
 * @param {Object} escrowData - Escrow transaction data
 * @returns {Promise<boolean>} Success status
 */
export const sendEscrowNotification = async (escrowData) => {
  console.log('📧 Starting email notification process...')
  
  // STEP 1: Try AWS SES first (if configured)
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && SNS_TOPIC_ARN && 
      AWS_ACCESS_KEY_ID !== 'your_aws_access_key_id' && 
      !SNS_TOPIC_ARN.includes('123456789012') &&
      !SNS_TOPIC_ARN.includes('YOUR_ACCOUNT_ID') &&
      SNS_TOPIC_ARN.startsWith('arn:aws:sns:')) {
    
    console.log('🚀 AWS configured - attempting AWS SES email delivery...')
    const awsResult = await tryAWSSESEmail(escrowData)
    if (awsResult) {
      return true
    }
    
    console.log('⚠️ AWS SES failed, trying EmailJS fallback...')
  } else {
    console.log('🔄 AWS not configured, using EmailJS directly')
  }
  
  // STEP 2: Fallback to EmailJS
  return await sendFallbackEmail(escrowData)
}

/**
 * Try sending email via AWS SES
 * @param {Object} escrowData - Escrow transaction data
 * @returns {Promise<boolean>} Success status
 */
const tryAWSSESEmail = async (escrowData) => {
  try {

    const explorerUrl = getExplorerUrl(escrowData.blockchain, escrowData.network, escrowData.txHash)
    
    const emailSubject = `🔐 WalletX Escrow Created Successfully - ${escrowData.amount} ${escrowData.symbol}`
    
    const emailBody = `
🎉 Your WalletX Escrow has been created successfully!

📋 Escrow Details:
• Escrow ID: #${escrowData.escrowId}
• Amount: ${escrowData.amount} ${escrowData.symbol}
• Recipient: ${escrowData.recipient}
• Network: ${escrowData.blockchain} (${escrowData.network})
• Transaction Hash: ${escrowData.txHash}

🔗 View on Explorer: ${explorerUrl}

🛡️ Security Information:
Your funds are now securely held in the WalletX smart contract. The recipient can claim them, or you can refund if unclaimed.

📱 Track Your Escrow:
Visit https://walletx.software to monitor your escrow status and manage your transactions.

Thank you for using WalletX - The Future of Multi-Chain Escrow! 🚀

---
WalletX Team
https://walletx.software
    `.trim()

    // Try AWS SES for direct email sending
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses')
    
    const sesClient = new SESClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    })

    const verifiedEmail = import.meta.env.VITE_AWS_SES_VERIFIED_EMAIL || 'kapoorh906@gmail.com'
    const fromName = import.meta.env.VITE_AWS_SES_FROM_NAME || 'WalletX Team'

    const sesCommand = new SendEmailCommand({
      Source: `${fromName} <${verifiedEmail}>`,
      Destination: {
        ToAddresses: [escrowData.email]
      },
      Message: {
        Subject: {
          Data: emailSubject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #1a1a1a; color: white; padding: 30px; border-radius: 10px;">
                  <h1 style="color: #8b5cf6; margin-bottom: 20px;">🎉 WalletX Escrow Created Successfully!</h1>
                  
                  <div style="background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #8b5cf6; margin-bottom: 15px;">📋 Escrow Details:</h3>
                    <p><strong>Escrow ID:</strong> #${escrowData.escrowId}</p>
                    <p><strong>Amount:</strong> ${escrowData.amount} ${escrowData.symbol}</p>
                    <p><strong>Recipient:</strong> ${escrowData.recipient}</p>
                    <p><strong>Network:</strong> ${escrowData.blockchain} (${escrowData.network})</p>
                    <p><strong>Transaction Hash:</strong> ${escrowData.txHash}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${explorerUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      🔗 View on Explorer
                    </a>
                  </div>
                  
                  <div style="background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #10b981; margin-bottom: 15px;">🛡️ Security Information:</h3>
                    <p>Your funds are now securely held in the WalletX smart contract. The recipient can claim them, or you can refund if unclaimed.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://walletx.software" style="color: #8b5cf6; text-decoration: none;">
                      📱 Visit WalletX to manage your escrow
                    </a>
                  </div>
                  
                  <hr style="border: 1px solid #444; margin: 30px 0;">
                  <p style="text-align: center; color: #888; font-size: 14px;">
                    Thank you for using WalletX - The Future of Multi-Chain Escrow! 🚀<br>
                    <a href="https://walletx.software" style="color: #8b5cf6;">walletx.software</a>
                  </p>
                </div>
              </div>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    })

    const sesResult = await sesClient.send(sesCommand)
    console.log('✅ AWS SES email sent successfully:', sesResult.MessageId)
    return true

  } catch (sesError) {
    console.log('⚠️ AWS SES failed:', sesError.message)
    
    // Handle SES Sandbox Mode restriction
    if (sesError.message.includes('Email address not verified') || 
        sesError.message.includes('MessageRejected') ||
        sesError.name === 'MessageRejected') {
      console.log('📧 AWS SES Sandbox Mode: Can only send to verified emails')
      console.log('🔄 Falling back to EmailJS for unverified emails')
    }
    
    // Return false to trigger EmailJS fallback
    return false
  }
}

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} Is valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Send test notification (for development/testing)
 * @param {string} email - Test email address
 * @returns {Promise<boolean>} Success status
 */
export const sendTestNotification = async (email) => {
  const testData = {
    email,
    escrowId: '123',
    amount: '0.001',
    symbol: 'ETH',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    blockchain: 'sepolia',
    network: 'testnet',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }

  return await sendEscrowNotification(testData)
}