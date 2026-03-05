import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDealStore, useWalletStore } from '@/store';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { NoKycDetailModal } from '@/components/withdraw';
import type { Deal } from '@/types';

// Coin icons
const CoinUsdt = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.926-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.658zm0-3.59v-2.366h5.414V8.616H8.595v2.811h5.414v2.364c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z" fill="white"/>
  </svg>
);

const CoinBtc = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M22.5 13.56c.313-2.088-1.28-3.212-3.456-3.962l.706-2.83-1.723-.43-.688 2.757c-.453-.113-.918-.22-1.382-.326l.692-2.773-1.722-.43-.707 2.83c-.375-.086-.743-.17-1.1-.259l.002-.01-2.376-.593-.459 1.84s1.28.293 1.252.312c.698.174.824.636.803 1.002l-.804 3.228c.048.012.11.03.179.057l-.182-.045-1.127 4.52c-.086.212-.302.53-.79.408.017.025-1.253-.313-1.253-.313l-.856 1.973 2.243.56c.417.104.826.214 1.229.316l-.715 2.872 1.722.43.707-2.835c.47.128.927.245 1.374.357l-.705 2.822 1.723.43.715-2.866c2.948.558 5.164.333 6.098-2.334.752-2.147-.037-3.385-1.588-4.193 1.13-.26 1.98-1.003 2.208-2.538zm-3.95 5.538c-.535 2.147-4.152.986-5.326.695l.95-3.81c1.174.293 4.93.874 4.376 3.115zm.535-5.569c-.488 1.953-3.496.96-4.47.717l.862-3.453c.974.243 4.11.696 3.608 2.736z" fill="white"/>
  </svg>
);

const CoinEth = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fill="white" fillOpacity="0.6"/>
    <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white"/>
    <path d="M16.498 21.968v6.027l7.502-10.376-7.502 4.349z" fill="white" fillOpacity="0.6"/>
    <path d="M16.498 27.995v-6.028L9 17.62l7.498 10.376z" fill="white"/>
    <path d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z" fill="white" fillOpacity="0.2"/>
    <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="white" fillOpacity="0.6"/>
  </svg>
);

// Icons
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none">
  <path d="M0.200195 5.54004V11.5713L4.80957 6.86426V0.515625L0.200195 5.54004Z" fill="white" stroke="white" stroke-width="0.4"/>
  <path d="M5.20996 6.88086L9.59277 11.5566V5.53711L5.20996 0.52832V6.88086Z" fill="white" stroke="white" stroke-width="0.4"/>
  <path d="M0.200195 13.9531V15.5098L4.80957 10.8027V9.19238L0.200195 13.9531Z" fill="white" stroke="white" stroke-width="0.4"/>
  <path d="M5.20996 10.8184L9.59277 15.4941V13.9482L5.20996 9.24219V10.8184Z" fill="white" stroke="white" stroke-width="0.4"/>
</svg>
);

const WalletIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M10 3.5V2.5C10 1.9485 9.5515 1.5 9 1.5H2.5C1.673 1.5 1 2.173 1 3V9C1 10.1005 1.897 10.5 2.5 10.5H10C10.5515 10.5 11 10.0515 11 9.5V4.5C11 3.9485 10.5515 3.5 10 3.5ZM9 8H8V6H9V8ZM2.5 3.5C2.37126 3.49424 2.2497 3.43905 2.16064 3.34591C2.07157 3.25277 2.02187 3.12887 2.02187 3C2.02187 2.87113 2.07157 2.74723 2.16064 2.65409C2.2497 2.56095 2.37126 2.50576 2.5 2.5H9V3.5H2.5Z" fill="white"/>
</svg>
);

const AnonymousIcon = () => (
   <svg
    xmlns="http://www.w3.org/2000/svg"
    width="132"
    height="107"
    viewBox="0 0 132 107"
    fill="none"
  >
    <g clipPath="url(#clip0_123_12321)">
      <path
        d="M101.635 82.1557C112.196 85.4981 118.066 96.9431 114.656 107.717C111.247 118.491 99.8618 124.476 89.3 121.133C79.5823 118.058 74.0093 108.191 75.7661 98.2228C75.8946 97.4932 75.7322 96.6896 75.1844 96.1059C71.395 92.068 67.1226 92.1594 64.7155 92.6865C63.9461 92.855 63.3854 93.4241 63.0893 94.0739C58.8712 103.33 48.517 108.228 38.7865 105.148C28.2249 101.806 22.3553 90.3609 25.7647 79.5871C29.1742 68.8133 40.5594 62.8286 51.121 66.1706C59.358 68.7772 64.734 76.3505 65.0153 84.754C65.0664 86.2795 66.3458 87.508 67.8494 87.5703C70.3355 87.6734 73.0265 88.385 75.627 90.0848C76.89 90.9103 78.6406 90.6304 79.554 89.4121C84.5747 82.7159 93.356 79.5359 101.635 82.1557ZM49.6219 70.9078C41.6145 68.3741 33.0282 72.9285 30.4516 81.0703C27.8755 89.211 32.2269 97.8618 40.2853 100.412C48.3439 102.962 56.8806 98.3899 59.4568 90.249C62.0329 82.1082 57.6805 73.458 49.6219 70.9078ZM100.135 86.8929C92.0769 84.3428 83.5405 88.9143 80.9642 97.055C78.388 105.196 82.7402 113.847 90.7988 116.397C98.8041 118.93 107.442 114.394 110.02 106.25C112.596 98.1067 108.192 89.4424 100.135 86.8929ZM32.3194 46.4932L128.334 76.8771C129.123 77.127 129.561 77.9699 129.311 78.7597L128.149 82.4327C127.899 83.2226 127.056 83.6602 126.266 83.4103L30.2519 53.0264C29.4621 52.7765 29.0244 51.9336 29.2744 51.1438L30.4367 47.4708L30.4904 47.327C30.7918 46.6288 31.5788 46.2589 32.3194 46.4932ZM104.907 23.0377C107.564 23.0274 109.736 25.016 110.031 27.5589L110.035 27.5888L110.041 27.6174L110.072 27.747C110.092 27.8307 110.105 27.916 110.11 28.0018L112.116 60.3189C112.181 61.3703 111.17 62.1595 110.166 61.8416L55.8257 44.6456C54.8222 44.328 54.4489 43.1027 55.1055 42.28L75.3982 16.8502L75.3988 16.8514C77.0414 14.8211 79.9924 14.3532 82.1855 15.7971L82.2014 15.8083L82.2189 15.818L82.425 15.9303L91.8233 22.7394C92.2604 23.056 92.7886 23.2227 93.3282 23.2146L104.907 23.0365L104.907 23.0377Z"
        fill="url(#paint0_linear_123_12321)"
        stroke="url(#paint1_linear_123_12321)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_123_12321"
        x1="38.2934"
        y1="106.351"
        x2="112.857"
        y2="14.9399"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4721FF" />
        <stop offset="1" stopColor="#C2FF0A" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_123_12321"
        x1="99.5348"
        y1="20.5519"
        x2="52.866"
        y2="108.874"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#BFED33" />
        <stop offset="1" stopColor="#4F2AFF" />
      </linearGradient>
      <clipPath id="clip0_123_12321">
        <rect
          width="125.649"
          height="125.649"
          fill="white"
          transform="translate(37.9089 -13) rotate(17.5601)"
        />
      </clipPath>
    </defs>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M10.8945 3.81596C10.6328 3.60248 10.2467 3.61772 10.0026 3.86153C9.75854 4.1056 9.7435 4.49161 9.95703 4.75346L10.0026 4.80424L12.5319 7.33354H2.00065C1.63246 7.33354 1.33398 7.63202 1.33398 8.00021C1.3341 8.3683 1.63253 8.66687 2.00065 8.66687H12.5306L10.0026 11.1949C9.74226 11.4552 9.74227 11.8772 10.0026 12.1376C10.263 12.3979 10.685 12.3979 10.9453 12.1376L14.3763 8.70659L14.4447 8.63041C14.7434 8.26385 14.7435 7.73517 14.4447 7.3687L14.3763 7.29252L10.9453 3.86153L10.8945 3.81596Z" fill="#BFED33"/>
</svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M1.85014 7.42796C1.18137 8.1749 1.16699 9.30176 1.78076 10.0945C2.99873 11.6676 4.33181 13.0006 5.90487 14.2186C6.69759 14.8324 7.82445 14.818 8.57139 14.1492C10.5993 12.3335 12.4563 10.436 14.2486 8.35063C14.4258 8.1445 14.5366 7.89183 14.5615 7.6211C14.6715 6.42402 14.8975 2.97514 13.9609 2.03852C13.0242 1.1019 9.57532 1.32788 8.37825 1.43787C8.10752 1.46275 7.85485 1.57358 7.64865 1.75077C5.5634 3.543 3.66586 5.4001 1.85014 7.42796Z" 
      fill="url(#paint0_linear_123_6374)"
    />
    <path 
      d="M4.66602 9.33203L6.666 11.332" 
      stroke="#623AFF" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M11 4C11.5523 4 12 4.44772 12 5C12 5.55228 11.5523 6 11 6C10.4477 6 10 5.55228 10 5C10 4.44772 10.4477 4 11 4Z" 
      fill="#623AFF"
    />
    <defs>
      <linearGradient 
        id="paint0_linear_123_6374" 
        x1="-1.01896" 
        y1="-0.334643" 
        x2="10.0562" 
        y2="16.4176" 
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="0.981727" stopColor="#D7CFF7" />
      </linearGradient>
    </defs>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Wallet illustration for empty state
const WalletIllustration = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="155 200 85 110" fill="none">
  <path opacity="0.5" d="M162.288 249.239H228.208C229.238 249.239 229.893 249.947 229.893 250.611V290.438C229.893 295.771 224.897 300.263 218.511 300.263H162.288C161.258 300.263 160.604 299.555 160.604 298.891V250.611C160.604 249.947 161.258 249.239 162.288 249.239Z" fill="url(#p0)" stroke="url(#p1)" stroke-width="1.5"/>
  <path d="M159.277 249.494H225.953C226.775 249.494 227.261 250.054 227.261 250.537V291.022C227.261 296.173 222.433 300.518 216.256 300.518H159.277C158.456 300.518 157.971 299.958 157.971 299.475V250.537C157.971 250.054 158.456 249.494 159.277 249.494Z" fill="url(#p2)" stroke="url(#p3)" stroke-width="1.5"/>
  
  <path d="M218.455 268.746H232.655C233.345 268.746 233.905 269.305 233.905 269.996V279.304C233.905 279.994 233.345 280.554 232.655 280.554H218.455C215.498 280.554 213.021 277.986 213.021 274.716V274.583C213.022 271.314 215.498 268.746 218.455 268.746Z" fill="url(#p4)" stroke="url(#p5)" stroke-width="1.5" stroke-linejoin="round"/>
  <path opacity="0.25" d="M234.655 274.716V281.304H218.456C215.04 281.304 212.271 278.384 212.271 274.782V274.65L234.655 274.716Z" fill="#272525"/>

  <g opacity="0.8">
    <path d="M187.42 232.005C192.592 227.162 192.592 219.311 187.42 214.469C182.248 209.626 173.862 209.626 168.689 214.469C163.517 219.311 163.517 227.162 168.689 232.005C173.862 236.847 182.248 236.847 187.42 232.005Z" fill="url(#p6)"/>
    <path d="M176.848 208.877C185.369 208.252 192.765 214.21 193.427 222.113C194.088 230.011 187.782 236.97 179.264 237.595C170.742 238.221 163.347 232.263 162.685 224.36C162.023 216.462 168.329 209.503 176.848 208.877ZM191.758 222.225C191.161 215.095 184.518 209.822 176.983 210.375C169.445 210.929 163.756 217.113 164.354 224.248C164.951 231.378 171.593 236.65 179.128 236.097Z" fill="#E8FFA1" stroke="url(#p7)"/>
    <path d="M183.391 223.599C182.962 223.143 182.337 222.809 181.517 222.598C181.99 222.299 182.335 221.935 182.552 221.509C182.769 221.082 182.855 220.595 182.809 220.049C182.718 218.962 182.238 218.164 181.37 217.653C180.502 217.143 179.285 216.945 177.718 217.06L177.152 217.101C177.111 216.609 177.07 216.117 177.029 215.625C176.991 215.172 176.117 215.237 176.154 215.689C176.196 216.181 176.237 216.673 176.278 217.165L175.71 217.207C175.668 216.715 175.627 216.223 175.586 215.731C175.548 215.278 174.674 215.343 174.712 215.795C174.753 216.287 174.794 216.779 174.835 217.271L172.54 217.44C172.289 217.458 172.102 217.537 171.98 217.674C171.857 217.812 171.806 218.002 171.827 218.244C171.85 218.528 171.948 218.718 172.12 218.813C172.291 218.908 172.662 218.935 173.231 218.893L173.597 218.866L174.38 228.218L174.014 228.245C173.401 228.29 173.017 228.369 172.863 228.481C172.708 228.593 172.643 228.788 172.666 229.065C172.687 229.314 172.767 229.496 172.907 229.611C173.047 229.726 173.246 229.774 173.505 229.755L175.866 229.582C175.908 230.074 175.949 230.566 175.99 231.058C176.028 231.51 176.902 231.446 176.864 230.994C176.823 230.502 176.782 230.009 176.741 229.517L177.309 229.476C177.35 229.968 177.392 230.46 177.433 230.952C177.471 231.404 178.345 231.34 178.307 230.888C178.266 230.396 178.225 229.904 178.184 229.412L178.472 229.39L179.425 229.32C180.238 229.261 180.863 229.171 181.299 229.052C181.735 228.933 182.126 228.763 182.472 228.543C183.05 228.166 183.484 227.707 183.773 227.163C184.062 226.62 184.181 226.033 184.128 225.404C184.065 224.656 183.819 224.054 183.391 223.599ZM178.087 218.536C178.944 218.473 179.615 218.59 180.101 218.885C180.587 219.18 180.856 219.635 180.907 220.251C180.962 220.901 180.749 221.401 180.269 221.749C179.789 222.098 179.024 222.311 177.974 222.388L177.597 222.415C177.491 221.142 177.384 219.869 177.278 218.596L178.087 218.536ZM176.403 218.66C176.51 219.933 176.617 221.206 176.723 222.48L176.155 222.521C176.048 221.248 175.942 219.975 175.835 218.702L176.403 218.66ZM176.618 228.054C176.499 226.635 176.381 225.217 176.262 223.798L176.83 223.757C176.949 225.175 177.068 226.594 177.187 228.012L176.618 228.054ZM181.478 227.201C180.937 227.571 179.971 227.808 178.582 227.91L178.061 227.948C177.942 226.529 177.823 225.111 177.704 223.692L178.336 223.646C179.703 223.546 180.672 223.638 181.243 223.923C181.814 224.209 182.131 224.735 182.195 225.504C182.259 226.265 182.02 226.831 181.478 227.201Z" fill="#C2FF0A"/>
  </g>

  <g opacity="0.5">
    <path d="M211.193 216.44C215.001 214.25 216.113 209.511 213.677 205.855C211.241 202.2 206.179 201.012 202.371 203.202C198.564 205.392 197.451 210.131 199.887 213.786C202.323 217.442 207.385 218.63 211.193 216.44Z" fill="url(#p8)"/>
    <path d="M208.058 201.17C213.199 201.985 216.735 206.542 216.032 211.292C215.33 216.037 210.645 219.285 205.507 218.471C200.366 217.655 196.831 213.098 197.534 208.349C198.236 203.604 202.92 200.355 208.058 201.17ZM215.385 211.179C216.051 206.677 212.705 202.466 207.987 201.718C203.266 200.97 198.849 203.954 198.181 208.462C197.515 212.964 200.86 217.174 205.578 217.922C210.299 218.671 214.717 215.686 215.385 211.179Z" fill="#C2FF0A" stroke="url(#p9)"/>
    <path d="M205.59 206.695C205.474 207.479 205.358 208.263 205.242 209.046L205.2 209.331L205.126 209.832C204.997 210.705 204.868 211.579 204.739 212.452L204.679 212.852L204.641 212.846L204.292 212.79L204.353 212.38L205.206 206.624L205.267 206.203L205.606 206.258L205.653 206.265L205.59 206.695ZM209.309 210.776C209.398 210.865 209.467 210.955 209.519 211.045L209.647 211.265C209.701 211.544 209.646 211.915C209.614 212.137 209.542 212.332 209.429 212.505L209.301 212.671C209.113 212.886 208.862 213.057 208.532 213.177C208.346 213.242 208.139 213.281 207.908 213.29C208.115 213.267 208.304 213.228 208.468 213.165L208.468 213.163C209.045 212.94 209.365 212.46 209.455 211.848C209.513 211.46 209.47 211.093 209.309 210.776ZM208.839 206.999C208.993 207.087 209.123 207.18 209.229 207.281C209.553 207.59 209.686 207.973 209.609 208.496C209.571 208.755 209.483 208.946 209.36 209.092C209.277 209.191 209.166 209.276 209.027 209.35C209.239 209.124 209.372 208.833 209.422 208.495C209.499 207.974 209.361 207.496 208.985 207.127L208.845 207.004C208.843 207.002 208.841 207.001 208.839 206.999Z" fill="#C2FF0A" stroke="url(#p10)"/>
  </g>

  <defs>
    <linearGradient id="p0" x1="197.917" y1="301.268" x2="223.006" y2="237.253" gradientUnits="userSpaceOnUse"><stop stop-color="#3B18DE"/><stop offset="1" stop-color="#C2FF0A" stop-opacity="0.9"/></linearGradient>
    <linearGradient id="p1" x1="195.248" y1="248.489" x2="195.248" y2="301.013" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
    <linearGradient id="p2" x1="195.285" y1="301.523" x2="220.373" y2="237.508" gradientUnits="userSpaceOnUse"><stop stop-color="#3B18DE"/><stop offset="1" stop-color="#C2FF0A" stop-opacity="0.9"/></linearGradient>
    <linearGradient id="p3" x1="192.615" y1="248.744" x2="192.615" y2="301.268" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
    <linearGradient id="p4" x1="224.307" y1="281.369" x2="229.656" y2="264.337" gradientUnits="userSpaceOnUse"><stop stop-color="#3B18DE"/><stop offset="1" stop-color="#C2FF0A" stop-opacity="0.9"/></linearGradient>
    <linearGradient id="p5" x1="223.463" y1="267.996" x2="223.463" y2="281.305" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
    <linearGradient id="p6" x1="188.217" y1="231.429" x2="179.61" y2="201.65" gradientUnits="userSpaceOnUse"><stop stop-color="#3B18DE"/><stop offset="1" stop-color="#C2FF0A" stop-opacity="0.9"/></linearGradient>
    <linearGradient id="p7" x1="178.056" y1="208.333" x2="178.056" y2="238.14" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
    <linearGradient id="p8" x1="211.756" y1="216.205" x2="210.779" y2="197.011" gradientUnits="userSpaceOnUse"><stop stop-color="#3B18DE"/><stop offset="1" stop-color="#C2FF0A" stop-opacity="0.9"/></linearGradient>
    <linearGradient id="p9" x1="208.894" y1="200.824" x2="204.671" y2="218.816" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
    <linearGradient id="p10" x1="207.86" y1="205.029" x2="205.586" y2="214.718" gradientUnits="userSpaceOnUse"><stop stop-color="#C2FF0A"/><stop offset="1" stop-color="#4E28FF"/></linearGradient>
  </defs>
</svg>
);

export function HomePage() {
  const navigate = useNavigate();
  const { user, userData, fetchUserData } = useAuthStore();
  const { deals, fetchDeals, isLoading: dealsLoading } = useDealStore();
  const { balances, fetchBalances, isLoading: balancesLoading } = useWalletStore();
  const { prices } = useCryptoPrices();

  const [showNoKycModal, setShowNoKycModal] = useState(false);

 // Inside HomePage component
const handleNoKycLearnMore = (e: React.MouseEvent) => {
  e.stopPropagation();
  // Navigate to the onboarding route instead of just opening a local modal
  navigate('/nokyc-onboarding'); 
};

  const handleNoKycGetStarted = () => {
    setShowNoKycModal(false);
    navigate('/nokyc-onboarding');
  };

  useEffect(() => {
    fetchDeals();
    fetchBalances();
    fetchUserData();
  }, [fetchDeals, fetchBalances, fetchUserData]);

  // Get balances
  const usdtBalance = balances.find((b) => b.currency === 'USDT' || b.currency === 'USDT_TRC20');
  const btcBalance = balances.find((b) => b.currency === 'BTC');
  const ethBalance = balances.find((b) => b.currency === 'ETH');
  const ltcBalance = balances.find((b) => b.currency === 'LTC');

  const usdtValue = parseFloat(usdtBalance?.total || '0');
  const btcValue = parseFloat(btcBalance?.total || '0');
  const ethValue = parseFloat(ethBalance?.total || '0');
  const ltcValue = parseFloat(ltcBalance?.total || '0');

  const totalBalance = usdtValue + btcValue * (prices.BTC || 0) + ethValue * (prices.ETH || 0) + ltcValue * (prices.LTC || 0);

  // Check if first-time user (no balance)
  // mariachange old
  const isFirstTime = totalBalance === 0 && !balancesLoading;
  // new
  // const isFirstTime = balances.length === 0 && !balancesLoading;

  // Level info (first-time users start at Starter level)
  const userLevel = isFirstTime ? 1 : (userData?.rewardLevel || 1);
  const userPoints = isFirstTime ? 0 : (userData?.rewardPoints || 0);
  const levelNames: Record<number, string> = {
    1: 'Starter', 2: 'Verified', 3: 'Bronze', 4: 'Silver', 5: 'Gold', 6: 'Platinum', 7: 'Elite',
  };
  const levelThresholds: Record<number, number> = {
    1: 500, 2: 1500, 3: 3000, 4: 6000, 5: 12000, 6: 25000, 7: 50000,
  };
  const nextLevelThreshold = levelThresholds[userLevel] || 12000;

  // Deals - separate tasks
  const pendingDeals = deals.filter(d => ['created', 'awaiting_deposit', 'funded', 'delivered'].includes(d.status));
  const taskDeal = pendingDeals.find(d => d.status === 'funded' || d.status === 'awaiting_deposit');

  const getUserRole = (deal: Deal): 'buyer' | 'seller' => {
    return deal.buyerId === user?.id ? 'buyer' : 'seller';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      created: 'Created', awaiting_deposit: 'Accepted', funded: 'Funded',
      delivered: 'Delivered', completed: 'Completed', disputed: 'Disputed',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      funded: { bg: 'rgba(147, 133, 255, 0.13)', text: '#afa7f6' },
      awaiting_deposit: { bg: 'rgba(64, 210, 112, 0.11)', text: '#84ba96' },
      delivered: { bg: 'rgba(250, 204, 21, 0.13)', text: '#facc15' },
    };
    return colors[status] || { bg: 'rgba(255, 255, 255, 0.09)', text: '#bab9be' };
  };

  const isLoading = dealsLoading || balancesLoading;

  return (
    <div className="figma-home-v3">
      {/* Background gradients */}
      <div className="figma-home-v3-bg-1" />
      <div className="figma-home-v3-bg-2" />

      {/* Top Section */}
      <div className="figma-home-v3-top">
        {/* Level Badge */}
        <div className="figma-home-v3-level-badge" onClick={() => navigate('/rewards')}>
          <StarIcon />
          <span className="figma-home-v3-level-text">{levelNames[userLevel]} level</span>
          <span className="figma-home-v3-level-divider">|</span>
          <span className="figma-home-v3-level-points">{userPoints.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {nextLevelThreshold.toLocaleString()}</span>
        </div>

        {/* Balance */}
        <div className="figma-home-v3-balance">
          <span className="figma-home-v3-balance-label">Escrow balance</span>
          <div className="figma-home-v3-balance-row">
            <span className="figma-home-v3-balance-amount">
              {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="figma-home-v3-balance-currency">USDT</span>
          </div>
        </div>

        {/* Asset Cards */}
        <div className="figma-home-v3-assets">
          <div className="figma-home-v3-asset" onClick={() => navigate('/wallet')}>
            <CoinUsdt />
            <span className="figma-home-v3-asset-name">USDT</span>
            <span className="figma-home-v3-asset-value">
              {isFirstTime ? '0.00' : usdtValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="figma-home-v3-asset" onClick={() => navigate('/wallet')}>
            <CoinBtc />
            <span className="figma-home-v3-asset-name">BTC</span>
            <span className="figma-home-v3-asset-value">
              {isFirstTime ? '0.00' : btcValue.toFixed(3).replace('.', ',')}
            </span>
          </div>
          <div className="figma-home-v3-asset" onClick={() => navigate('/wallet')}>
            <CoinEth />
            <span className="figma-home-v3-asset-name">ETH</span>
            <span className="figma-home-v3-asset-value">
              {isFirstTime ? '0.00' : ethValue.toFixed(3).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Open Wallet Button */}
        <button className="figma-home-v3-wallet-btn" onClick={() => navigate('/wallet')}>
          <WalletIcon />
          <span>Open wallet</span>
        </button>
      </div>

      {/* Container Section */}
      {isFirstTime ? (
        /* First-time Empty State */
        <div className="figma-home-v3-empty">
          <div className="figma-home-v3-empty-illustration">
            <WalletIllustration />
          </div>
          <div className="figma-home-v3-empty-content">
            <h3 className="figma-home-v3-empty-title">Welcome to your wallet!</h3>
            <p className="figma-home-v3-empty-subtitle">
              Add funds to your escrow balance to create your first deal
            </p>
          </div>
          <button className="figma-home-v3-fund-btn" onClick={() => navigate('/deposit?currency=USDT')}>
            Fund wallet
          </button>
        </div>
      ) : (
        /* Normal State with content */
        <div className="figma-home-v3-container">
          {/* For You Section */}
          <div className="figma-home-v3-section">
            <h3 className="figma-home-v3-section-title">For you</h3>
            <div className="figma-home-v3-nokyc-card" onClick={handleNoKycLearnMore}>
              <div className="figma-home-v3-nokyc-content">
                <h4 className="figma-home-v3-nokyc-title">No-KYC cash withdrawals</h4>
                <p className="figma-home-v3-nokyc-subtitle">Private access with one-time setup</p>
                <button className="figma-home-v3-nokyc-btn" onClick={handleNoKycLearnMore}>
                  <span>Learn more</span>
                  <ArrowRightIcon />
                </button>
              </div>
              <div className="figma-home-v3-nokyc-icon">
                <AnonymousIcon />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="figma-home-v3-section">
            <h3 className="figma-home-v3-section-title">Tasks</h3>
            {taskDeal ? (
              <div className="figma-home-v3-task-card" onClick={() => navigate(`/deal/${taskDeal.id}`)}>
                <span className="figma-home-v3-task-label">New deal</span>
                <div className="figma-home-v3-task-header">
                  <span className="figma-home-v3-task-amount">
                    {parseFloat(taskDeal.amount).toLocaleString()} {taskDeal.currency.toLowerCase().includes('usdt') ? 'USDT' : taskDeal.currency.toUpperCase()}
                  </span>
                  <span
                    className="figma-home-v3-badge"
                    style={{
                      backgroundColor: getStatusColor(taskDeal.status).bg,
                      color: getStatusColor(taskDeal.status).text
                    }}
                  >
                    {getStatusLabel(taskDeal.status)}
                  </span>
                </div>
                <p className="figma-home-v3-task-desc">{taskDeal.description || 'No description'}</p>
                <div className="figma-home-v3-divider" />
                <div className="figma-home-v3-task-footer">
                  <div className="figma-home-v3-task-user">
                    <span>{getUserRole(taskDeal) === 'buyer' ? taskDeal.sellerUsername : taskDeal.buyerUsername || 'Unknown'}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.64)" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span className="figma-home-v3-task-id">{taskDeal.dealNumber || ''}</span>
                </div>
                <button className="figma-home-v3-task-btn">
                  Review and pay
                </button>
              </div>
            ) : (
              <div className="figma-home-v3-task-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '14px' }}>
                  No active tasks right now
                </p>
                <button className="figma-home-v3-task-btn" onClick={() => navigate('/create')}>
                  Create your first deal
                </button>
              </div>
            )}
          </div>

          {/* Coupon Banner */}
          <div className="figma-home-v3-coupon" onClick={() => navigate('/rewards')}>
            <div className="figma-home-v3-coupon-content">
              <TagIcon />
              <span>25 USDT off your next escrow fee</span>
            </div>
            <ChevronRightIcon />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="figma-home-v3-loading">
          <div className="figma-home-v3-spinner" />
        </div>
      )}

      {/* No-KYC Detail Modal */}
      <NoKycDetailModal
        isOpen={showNoKycModal}
        onClose={() => setShowNoKycModal(false)}
        onGetStarted={handleNoKycGetStarted}
      />
    </div>
  );
}
