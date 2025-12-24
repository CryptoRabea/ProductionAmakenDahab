import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, FileText, Check, Globe } from 'lucide-react';

interface ProviderAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

type Language = 'ar' | 'en';

const ProviderAgreementModal: React.FC<ProviderAgreementModalProps> = ({
  isOpen,
  onClose,
  onAgree
}) => {
  const [language, setLanguage] = useState<Language>('en');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, language]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider "scrolled to bottom" when within 50px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-dahab-teal to-blue-500">
          <div className="flex items-center gap-3 text-white">
            <FileText size={24} />
            <h2 className="text-lg font-bold">
              {language === 'ar' ? 'شروط وأحكام المستخدمين' : 'Client Terms & Conditions'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <Globe size={16} className="text-gray-500" />
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                language === 'en'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                language === 'ar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="absolute top-[120px] left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 animate-pulse">
              <ChevronDown size={16} />
              {language === 'ar'
                ? 'يرجى التمرير للأسفل لقراءة جميع الشروط'
                : 'Please scroll down to read all terms'}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6"
          style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
        >
          {language === 'ar' ? <ArabicContent /> : <EnglishContent />}
        </div>

        {/* Quick Scroll Button */}
        {!hasScrolledToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 bg-dahab-teal text-white p-3 rounded-full shadow-lg hover:bg-dahab-teal/90 transition animate-bounce"
            title={language === 'ar' ? 'انتقل للأسفل' : 'Scroll to bottom'}
          >
            <ChevronDown size={24} />
          </button>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={onAgree}
              disabled={!hasScrolledToBottom}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                hasScrolledToBottom
                  ? 'bg-dahab-teal text-white hover:bg-dahab-teal/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasScrolledToBottom ? (
                <>
                  <Check size={18} />
                  {language === 'ar' ? 'أوافق على الشروط والأحكام' : 'I Agree to Terms & Conditions'}
                </>
              ) : (
                language === 'ar' ? 'يرجى قراءة جميع الشروط أولاً' : 'Please read all terms first'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnglishContent: React.FC = () => (
  <div className="prose prose-sm max-w-none text-gray-700">
    <p className="text-sm text-gray-600 italic mb-6">
      Please read the following Terms & Conditions carefully before using the application as a Client.
      By using the app, you agree to be fully bound by these terms.
    </p>

    <Section title="1. Definitions">
      <Definition
        term="Application"
        definition="A digital platform for listing events, managing bookings, and connecting Clients with Providers."
      />
      <Definition
        term="Client"
        definition="Any individual using the application to browse, book, or purchase event tickets."
      />
      <Definition
        term="Provider"
        definition="The individual or entity responsible for organizing and delivering the event."
      />
      <Definition
        term="Event"
        definition="Any event listed on the application, whether free or paid."
      />
    </Section>

    <Section title="2. App Usage">
      <ul className="list-disc pl-5 space-y-2">
        <li>Clients must use the application for lawful purposes only.</li>
        <li>Clients must provide accurate information during registration or booking.</li>
        <li>The application reserves the right to suspend or restrict accounts in case of misuse.</li>
      </ul>
    </Section>

    <Section title="3. Bookings & Tickets">
      <ul className="list-disc pl-5 space-y-2">
        <li>The application allows Clients to book or purchase tickets for listed events.</li>
        <li>Booking confirmation will be sent to the Client after successful payment.</li>
        <li>Tickets are personal and may not be resold without the application's approval.</li>
      </ul>
    </Section>

    <Section title="4. Pricing & Payments">
      <ul className="list-disc pl-5 space-y-2">
        <li>Ticket prices are clearly displayed before booking confirmation.</li>
        <li>All payments are processed through the application's approved payment methods.</li>
        <li>The application is not responsible for payment errors caused by incorrect user information.</li>
      </ul>
    </Section>

    <Section title="5. Cancellation & Refunds">
      <ul className="list-disc pl-5 space-y-2">
        <li>Cancellation and refund policies are determined by the Provider for each event.</li>
        <li>Clients must review cancellation policies before booking.</li>
        <li>If an event is canceled by the Provider, refunds are handled according to the stated policy.</li>
      </ul>
    </Section>

    <Section title="6. Liability">
      <ul className="list-disc pl-5 space-y-2">
        <li>The application acts as an intermediary and is not responsible for event execution.</li>
        <li>The application is not liable for injuries or damages occurring during events.</li>
      </ul>
    </Section>

    <Section title="7. Amendments & Termination">
      <ul className="list-disc pl-5 space-y-2">
        <li>The application may amend these Terms & Conditions at any time with notice.</li>
        <li>User accounts may be suspended or terminated for violations.</li>
      </ul>
    </Section>

    <Section title="8. Governing Law">
      <p>These Terms & Conditions are governed by the laws of the Arab Republic of Egypt.</p>
    </Section>

    <div className="mt-8 p-4 bg-dahab-teal/10 rounded-xl border border-dahab-teal/20">
      <h3 className="font-bold text-gray-900 mb-3">Summary</h3>
      <p className="text-sm text-gray-700 mb-3">By using the app, you agree to:</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Follow booking and payment terms for each event.</li>
        <li>Review cancellation policies before booking.</li>
        <li>Acknowledge that the app acts as an intermediary and is not responsible for event delivery.</li>
      </ul>
      <p className="text-xs text-gray-500 mt-4 italic">
        This is a summary. Full Terms & Conditions remain legally binding.
      </p>
    </div>

    <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center">
      <p className="font-medium text-gray-900">
        By using the application as a Client, you confirm your full acceptance of all the above terms.
      </p>
    </div>
  </div>
);

const ArabicContent: React.FC = () => (
  <div className="prose prose-sm max-w-none text-gray-700">
    <p className="text-sm text-gray-600 italic mb-6">
      يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام التطبيق كمستخدم. باستخدامك للتطبيق، فإنك توافق على الالتزام الكامل بهذه الشروط.
    </p>

    <Section title="أولاً: التعريفات">
      <Definition
        term="التطبيق"
        definition="منصة إلكترونية لعرض الفعاليات وتنظيم الحجوزات وربط المستخدمين بمقدمي الخدمات."
      />
      <Definition
        term="المستخدم (Client)"
        definition="أي شخص يستخدم التطبيق لتصفح الفعاليات أو حجز أو شراء تذاكر."
      />
      <Definition
        term="مقدم الخدمة (Provider)"
        definition="الجهة أو الشخص المسؤول عن تنظيم وتنفيذ الفعالية."
      />
      <Definition
        term="الفعالية / الإيفينت"
        definition="أي حدث يتم عرضه على التطبيق سواء كان مجانيًا أو مدفوعًا."
      />
    </Section>

    <Section title="ثانياً: استخدام التطبيق">
      <ul className="list-disc pr-5 space-y-2">
        <li>يلتزم المستخدم باستخدام التطبيق لأغراض مشروعة فقط.</li>
        <li>يلتزم المستخدم بإدخال بيانات صحيحة عند التسجيل أو الحجز.</li>
        <li>يحق للتطبيق إيقاف أو تقييد أي حساب في حال إساءة الاستخدام.</li>
      </ul>
    </Section>

    <Section title="ثالثاً: الحجز والتذاكر">
      <ul className="list-disc pr-5 space-y-2">
        <li>يتيح التطبيق للمستخدمين حجز أو شراء تذاكر الفعاليات المعروضة.</li>
        <li>بعد إتمام عملية الدفع، يتم إرسال تأكيد الحجز إلى المستخدم عبر التطبيق أو البريد الإلكتروني.</li>
        <li>التذكرة صالحة للاستخدام من قبل المستخدم فقط ولا يجوز إعادة بيعها إلا بموافقة التطبيق.</li>
      </ul>
    </Section>

    <Section title="رابعاً: الأسعار والدفع">
      <ul className="list-disc pr-5 space-y-2">
        <li>يتم عرض أسعار التذاكر بوضوح داخل التطبيق قبل تأكيد الحجز.</li>
        <li>تتم جميع عمليات الدفع من خلال وسائل الدفع المعتمدة داخل التطبيق.</li>
        <li>لا يتحمل التطبيق مسؤولية أي أخطاء ناتجة عن إدخال بيانات دفع غير صحيحة من قبل المستخدم.</li>
      </ul>
    </Section>

    <Section title="خامساً: الإلغاء والاسترداد">
      <ul className="list-disc pr-5 space-y-2">
        <li>تخضع سياسات الإلغاء والاسترداد لشروط مقدم الخدمة الخاصة بكل فعالية.</li>
        <li>يجب على المستخدم مراجعة سياسة الإلغاء قبل إتمام الحجز.</li>
        <li>في حال إلغاء الفعالية من قبل مقدم الخدمة، يتم التعامل مع الاسترداد وفق السياسة المعلنة.</li>
      </ul>
    </Section>

    <Section title="سادساً: المسؤولية">
      <ul className="list-disc pr-5 space-y-2">
        <li>التطبيق يعمل كوسيط بين المستخدم ومقدم الخدمة ولا يتحمل مسؤولية تنفيذ الفعالية.</li>
        <li>لا يتحمل التطبيق أي مسؤولية عن أي إصابات أو أضرار تحدث أثناء الفعالية.</li>
      </ul>
    </Section>

    <Section title="سابعاً: التعديلات وإنهاء الخدمة">
      <ul className="list-disc pr-5 space-y-2">
        <li>يحق للتطبيق تعديل هذه الشروط والأحكام في أي وقت مع إخطار المستخدمين.</li>
        <li>يحق للتطبيق إيقاف أو إنهاء حساب المستخدم في حال مخالفة الشروط.</li>
      </ul>
    </Section>

    <Section title="ثامناً: القانون المنظم">
      <p>تخضع هذه الشروط والأحكام للقوانين المعمول بها في جمهورية مصر العربية.</p>
    </Section>

    <div className="mt-8 p-4 bg-dahab-teal/10 rounded-xl border border-dahab-teal/20">
      <h3 className="font-bold text-gray-900 mb-3">نسخة مختصرة</h3>
      <p className="text-sm text-gray-700 mb-3">باستخدامك للتطبيق، فإنك توافق على:</p>
      <ul className="list-disc pr-5 space-y-1 text-sm">
        <li>الالتزام بشروط الحجز والدفع لكل فعالية.</li>
        <li>مراجعة سياسة الإلغاء قبل تأكيد الحجز.</li>
        <li>إقرارك بأن التطبيق وسيط وليس مسؤولًا عن تنفيذ الفعاليات.</li>
      </ul>
      <p className="text-xs text-gray-500 mt-4 italic">
        هذه نسخة مختصرة. الشروط والأحكام الكاملة تبقى ملزمة قانونياً.
      </p>
    </div>

    <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center">
      <p className="font-medium text-gray-900">
        باستخدامك للتطبيق كمستخدم، فإنك تقر بموافقتك الكاملة على جميع ما ورد أعلاه.
      </p>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
      {title}
    </h3>
    {children}
  </div>
);

const Definition: React.FC<{ term: string; definition: string }> = ({ term, definition }) => (
  <div className="mb-2">
    <span className="font-semibold text-dahab-teal">{term}:</span>{' '}
    <span>{definition}</span>
  </div>
);

export default ProviderAgreementModal;
