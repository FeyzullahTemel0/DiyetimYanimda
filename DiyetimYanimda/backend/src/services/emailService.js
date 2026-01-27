const nodemailer = require('nodemailer');

// Gmail SMTP konfigürasyonu - Geliştirilmiş versiyon
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS kullan
  auth: {
    user: process.env.EMAIL_USER,  // Tam email adresi
    pass: process.env.EMAIL_PASSWORD.trim()  // App Password (boşlukları kaldır)
  },
  tls: {
    rejectUnauthorized: false // Development için geçiçi çözüm
  }
});

// Development modunda email göndermeyi test et
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️  Email servisi yapılandırılmamış:');
      console.log('   - EMAIL_USER:', process.env.EMAIL_USER ? '✓ Ayarlı' : '✗ Boş');
      console.log('   - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Ayarlı' : '✗ Boş');
    } else if (success) {
      console.log('✅ Email servisi hazır!');
    }
  });
}

// Email gönderme fonksiyonu
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // EMAIL_USER ve EMAIL_PASSWORD kontrolü
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  EMAIL_USER veya EMAIL_PASSWORD tanımlanmamış!');
      console.warn('📝 .env dosyasında şu değişkenleri kontrol edin:');
      console.warn('   EMAIL_USER=your-email@gmail.com');
      console.warn('   EMAIL_PASSWORD=your-16-char-app-password');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 TEST MODU: Email link gösterilecek');
        console.log('📧 Alıcı:', to);
        console.log('📌 Konu:', subject);
        // Development'da da true dön ki sistem çalışsın
        return true;
      }
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    };

    console.log('📤 Email gönderiliyor:', {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email başarıyla gönderildi!');
    console.log('   Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email gönderme hatası:');
    console.error('   Hata Kodu:', error.code);
    console.error('   Hata Mesajı:', error.message);
    
    if (error.code === 'EAUTH' || error.message.includes('Username and Password not accepted')) {
      console.error('   🔑 Kimlik doğrulama hatası!');
      console.error('   ✓ EMAIL_USER tam email adresi mi? (ornek@gmail.com)');
      console.error('   ✓ EMAIL_PASSWORD gerçekten App Password mı?');
      console.error('   ✓ App Password boşlukları: "abcd efgh ijkl mnop" şeklinde mi?');
      console.error('   📱 Yeni App Password oluştur: https://myaccount.google.com/apppasswords');
    }
    if (error.code === 'ESOCKET' || error.message.includes('connect ECONNREFUSED')) {
      console.error('   🔌 Ağ/İnternet bağlantısı hatası');
    }
    return false;
  }
};

// Şifre sıfırlama email template'i (güzel ve emojili)
const getPasswordResetEmailTemplate = (resetLink, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 40px;
          color: #333;
        }
        .header {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          color: #667eea;
          margin: 0;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          margin: 0;
          font-size: 14px;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .reset-button {
          text-align: center;
          margin: 30px 0;
        }
        .reset-button a {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
          transition: transform 0.3s;
        }
        .reset-button a:hover {
          transform: scale(1.05);
        }
        .warning {
          background: #fff3cd;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          border-left: 4px solid #ffc107;
          color: #856404;
          font-size: 13px;
        }
        .footer {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 8px;
          color: white;
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
        }
        .emoji {
          font-size: 24px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="emoji">🔐</span>Şifre Sıfırlama</h1>
          <p>Diyetim Yanımda - Güvenli Şifre Değişim Sistemi</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            👋 Merhaba ${userName},
          </div>
          
          <div class="message">
            <p>Hesabınız için bir şifre sıfırlama isteği aldık. Aşağıdaki butona tıklayarak yeni bir şifre belirleyebilirsiniz.</p>
          </div>
          
          <div class="reset-button">
            <a href="${resetLink}">🔑 Şifremi Sıfırla</a>
          </div>
          
          <div class="warning">
            ⚠️ <strong>Önemli:</strong> Bu link 1 saat için geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.
          </div>
          
          <div class="message" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              <strong>💡 İpucu:</strong> Şifrenizi düzenli olarak değiştirerek hesabınızı güvenli tutun.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">© 2024 Diyetim Yanımda - Tüm Hakları Saklıdır</p>
          <p style="margin: 10px 0 0 0; font-size: 11px;">Bu bir otomatik email'dir, lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Şifre sıfırlama başarılı email template'i
const getPasswordResetSuccessEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border-radius: 12px;
          padding: 40px;
          color: #333;
        }
        .header {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          color: #11998e;
          margin: 0;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
        }
        .success-icon {
          font-size: 48px;
          margin: 20px 0;
        }
        .message {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .footer {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 8px;
          color: white;
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Şifre Değiştirildi</h1>
          <p>Diyetim Yanımda - Hesap Güvenliği</p>
        </div>
        
        <div class="content">
          <div class="success-icon">✨</div>
          
          <div class="message">
            <p>Merhaba ${userName},</p>
            <p>Şifreniz başarıyla değiştirilmiştir. Artık yeni şifrenizle giriş yapabilirsiniz.</p>
          </div>
          
          <div class="message" style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Eğer bu işlemi siz yapmadıysanız, lütfen <strong>derhal</strong> desteğimizle iletişime geçin.
            </p>
          </div>
          
          <div class="message">
            <p style="color: #999; font-size: 12px;">
              🔒 Hesaplarınızı güvenli tutmak için düzenli olarak şifrenizi kontrol edin.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">© 2024 Diyetim Yanımda - Tüm Hakları Saklıdır</p>
          <p style="margin: 10px 0 0 0; font-size: 11px;">Bu bir otomatik email'dir, lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  getPasswordResetEmailTemplate,
  getPasswordResetSuccessEmailTemplate
};
